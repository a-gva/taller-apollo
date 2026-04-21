import { count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "./client";
import { users } from "./schema";

const seedUsers = [
  { id: uuidv4(), name: "Ada Lovelace", email: "ada@example.com" },
  { id: uuidv4(), name: "Grace Hopper", email: "grace@example.com" },
];

async function run() {
  const existing = await db.select({ value: count() }).from(users);
  const total = existing[0]?.value ?? 0;

  if (total > 0) {
    console.log("Seed skipped, users already exist.");
    return;
  }

  await db.insert(users).values(seedUsers);
  console.log("Seed complete.");
}

run();
