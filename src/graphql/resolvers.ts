import { and, asc, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../db/client';
import { users } from '../db/schema';

type UserMutationInput = {
  id?: string;
  name: string;
  email: string;
  age: number;
};

type ListOptions = {
  limit?: number;
  offset?: number;
  sortOrder?: 'ASC' | 'DESC';
};

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
  Query: {
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
      return row[0];
    },
    userDelete: async (_parent: unknown, args: { id: string }) => {
      const deleted = await db
        .delete(users)
        .where(and(eq(users.id, args.id)))
        .returning({ id: users.id });

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
      return updated[0];
    },
  },
};
