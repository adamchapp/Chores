import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./client";

/** Default location of the generated SQL migrations in this package. */
export const defaultMigrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

/**
 * Apply all pending migrations. Migrations must follow expand/contract so that
 * the previous app revision keeps working during a rollout (PLAN §7).
 */
export async function runMigrations(
  connectionString: string,
  migrationsFolder: string = defaultMigrationsFolder,
): Promise<void> {
  const { db, pool } = createDb(connectionString);
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}
