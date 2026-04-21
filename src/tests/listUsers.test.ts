import { expect, test } from 'vitest';
import { z } from 'zod';
import { mockListUsers } from './mockedListUsers';

const getAllUsers = async () => {
  const response = await fetch('http://localhost:4010/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
            listUsers {
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
  console.log(data);
  expect(data?.success).toBe(true);
  expect(data?.data).toEqual(mockListUsers.data);
});
