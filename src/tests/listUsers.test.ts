import { expect, test } from 'vitest';
import { z } from 'zod';
import { mockedListUsers } from './mockedListUsers';

const getAllUsers = async (options?: { limit?: number }) => {
  const response = await fetch('http://localhost:4010/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
            listUsers(options: { limit: ${options?.limit ?? 100} }) {
                id
                name
                email
                age
            }
        }
    `,
    }),
  });
  const data = await response.json();
  // zod validate
  const parsedData = z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      age: z.number(),
    })
    .array()
    .safeParse(data?.data?.listUsers as unknown[]);

  return parsedData;
};

test('it should return all users', async () => {
  const data = await getAllUsers();
  expect(data?.success).toBe(true);
  expect(data?.data).toEqual(mockedListUsers.data);
});

test('it should limit the number of users returned', async () => {
  const data = await getAllUsers({ limit: 1 });
  expect(data?.success).toBe(true);
  expect(data?.data.length).toBe(1);
});
