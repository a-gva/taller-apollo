import { beforeAll, expect, test } from 'vitest';
import { db } from '../db/client';
import { users } from '../db/schema';
import { resolvers } from '../graphql/resolvers';
import { mockedListUsers } from './mockedListUsers';

const getAllUsers = async (options?: { limit?: number }) => {
  return resolvers.Query.listUsers(
    {},
    { options: { limit: options?.limit ?? 100 } },
  );
};

beforeAll(async () => {
  await db.delete(users);
  await db.insert(users).values(mockedListUsers.data).onConflictDoNothing();
});

test('it should return all users', async () => {
  const data = await getAllUsers();
  expect(data).toHaveLength(mockedListUsers.data.length);
  expect([...(data ?? [])].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
    [...mockedListUsers.data].sort((a, b) => a.id.localeCompare(b.id)),
  );
});

test('it should limit the number of users returned', async () => {
  const data = await getAllUsers({ limit: 1 });
  expect(data.length).toBe(1);
});
