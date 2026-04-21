import { mockUsers } from '../tests/mockedListUsers';
import { db } from './client';
import { users } from './schema';

async function run() {
  const result = await db
    .insert(users)
    .values(mockUsers)
    .onConflictDoNothing()
    .returning();
  console.log(
    `Seed complete. Inserted ${result.length} new users, skipped ${
      mockUsers.length - result.length
    } existing users.`,
  );
}

run().catch((error) => {
  console.error('Seed failed.');
  console.error(error);
  process.exit(1);
});
