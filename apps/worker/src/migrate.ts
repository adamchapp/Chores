// Entry point for the "migrate" Cloud Run Job, run before each deploy.
import { runMigrations } from "@chores/db";

const url = process.env.DATABASE_URL;
const folder = process.env.MIGRATIONS_DIR;
if (!url || !folder) {
  console.error("DATABASE_URL and MIGRATIONS_DIR must be set");
  process.exit(1);
}
await runMigrations(url, folder);
console.log("Migrations applied");
