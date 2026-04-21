import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "./client";

migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied.");
