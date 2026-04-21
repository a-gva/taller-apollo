import { and, asc, desc, eq } from 'drizzle-orm';
import { PubSub } from 'graphql-subscriptions';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../db/client';
import { comments, users } from '../db/schema';

type UserMutationInput = {
  id?: string;
  name: string;
  email: string;
  age: number;
};

type CommentMutationInput = {
  id?: string;
  content: string;
  userId: string;
};

type ListOptions = {
  limit?: number;
  offset?: number;
  sortOrder?: 'ASC' | 'DESC';
};

const pubsub = new PubSub();
const USER_CREATED = 'USER_CREATED';
const USER_DELETED = 'USER_DELETED';
const USER_PATCHED = 'USER_PATCHED';

async function* withSubscriptionLogging<T>(
  action: 'created' | 'deleted' | 'patched',
  iterator: AsyncIterable<T>,
) {
  for await (const payload of iterator) {
    console.log(`[subscription:${action}]`, JSON.stringify(payload));
    yield payload;
  }
}

export const resolvers = {
  User: {
    comments: async (parent: { id: string }, args: { limit?: number }) => {
      const baseQuery = db
        .select()
        .from(comments)
        .where(eq(comments.userId, parent.id));

      if (args.limit === undefined || args.limit === null) {
        return baseQuery;
      }

      return baseQuery.limit(Math.max(0, args.limit));
    },
  },
  Query: {
    comments: async (_parent: unknown, args: { options?: ListOptions }) => {
      const limit = Math.max(0, args.options?.limit ?? 100);
      const offset = Math.max(0, args.options?.offset ?? 0);
      const sortOrder = args.options?.sortOrder ?? 'DESC';
      const orderByExpr =
        sortOrder === 'ASC' ? asc(comments.id) : desc(comments.id);

      return db
        .select()
        .from(comments)
        .orderBy(orderByExpr)
        .limit(limit)
        .offset(offset);
    },
    comment: async (_parent: unknown, args: { id: string }) => {
      const row = await db
        .select()
        .from(comments)
        .where(eq(comments.id, args.id))
        .limit(1);
      return row[0] ?? null;
    },
    listUsers: async (_parent: unknown, args: { options?: ListOptions }) => {
      const limit = Math.max(0, args.options?.limit ?? 100);
      const offset = Math.max(0, args.options?.offset ?? 0);
      const sortOrder = args.options?.sortOrder ?? 'DESC';
      const orderByExpr = sortOrder === 'ASC' ? asc(users.id) : desc(users.id);

      return db
        .select()
        .from(users)
        .orderBy(orderByExpr)
        .limit(limit)
        .offset(offset);
    },
    getUser: async (_parent: unknown, args: { id: string }) => {
      const row = await db
        .select()
        .from(users)
        .where(eq(users.id, args.id))
        .limit(1);
      return row[0] ?? null;
    },
  },
  Mutation: {
    commentCreate: async (
      _parent: unknown,
      args: { input: Pick<CommentMutationInput, 'content' | 'userId'> },
    ) => {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, args.input.userId))
        .limit(1);
      if (!existingUser[0]) {
        throw new Error('Cannot create comment: user does not exist.');
      }

      const id = uuidv4();
      const value = {
        id,
        content: args.input.content,
        userId: args.input.userId,
      };
      await db.insert(comments).values(value);
      return value;
    },
    commentDelete: async (_parent: unknown, args: { id: string }) => {
      const deleted = await db
        .delete(comments)
        .where(and(eq(comments.id, args.id)))
        .returning({ id: comments.id });
      return deleted.length > 0;
    },
    commentPatch: async (
      _parent: unknown,
      args: {
        id: string;
        input: Pick<CommentMutationInput, 'content' | 'id' | 'userId'>;
      },
    ) => {
      const row = await db
        .select()
        .from(comments)
        .where(eq(comments.id, args.id))
        .limit(1);
      if (!row[0]) {
        throw new Error('Comment not found.');
      }
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, args.input.userId))
        .limit(1);
      if (!existingUser[0]) {
        throw new Error('Cannot patch comment: user does not exist.');
      }
      const value = { content: args.input.content, userId: args.input.userId };
      await db.update(comments).set(value).where(eq(comments.id, args.id));
      return row[0];
    },
    userCreate: async (
      _parent: unknown,
      args: { input: Pick<UserMutationInput, 'name' | 'email' | 'age'> },
    ) => {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, args.input.email))
        .limit(1);
      if (existing[0]) {
        throw new Error('User with this email already exists.');
      }

      const id = uuidv4();
      const value = {
        id,
        name: args.input.name,
        email: args.input.email,
        age: args.input.age,
      };

      await db.insert(users).values(value);

      const row = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      if (!row[0]) {
        throw new Error('Failed to upsert user.');
      }
      await pubsub.publish(USER_CREATED, { userCreated: row[0] });
      return row[0];
    },
    userDelete: async (_parent: unknown, args: { id: string }) => {
      const deleted = await db
        .delete(users)
        .where(and(eq(users.id, args.id)))
        .returning({ id: users.id });

      if (deleted[0]) {
        await pubsub.publish(USER_DELETED, { userDeleted: deleted[0].id });
      }
      return deleted.length > 0;
    },
    userPatch: async (
      _parent: unknown,
      args: { id: string; input: Pick<UserMutationInput, 'name' | 'email'> },
    ) => {
      const row = await db
        .select()
        .from(users)
        .where(eq(users.id, args.id))
        .limit(1);
      if (!row[0]) {
        throw new Error('User not found.');
      }
      const value = { name: args.input.name, email: args.input.email };
      await db.update(users).set(value).where(eq(users.id, args.id));
      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, args.id))
        .limit(1);
      if (!updated[0]) {
        throw new Error('Failed to patch user.');
      }
      await pubsub.publish(USER_PATCHED, { userPatched: updated[0] });
      return updated[0];
    },
  },
  Subscription: {
    userCreated: {
      subscribe: () =>
        withSubscriptionLogging(
          'created',
          pubsub.asyncIterableIterator([USER_CREATED]),
        ),
    },
    userDeleted: {
      subscribe: () =>
        withSubscriptionLogging(
          'deleted',
          pubsub.asyncIterableIterator([USER_DELETED]),
        ),
    },
    userPatched: {
      subscribe: () =>
        withSubscriptionLogging(
          'patched',
          pubsub.asyncIterableIterator([USER_PATCHED]),
        ),
    },
  },
};
