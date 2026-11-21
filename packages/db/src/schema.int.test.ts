import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { runMigrations } from "./migrate";
import { auditLog, devices, guardians, households, kids } from "./schema";

let container: StartedPostgreSqlContainer;
let handle: ReturnType<typeof createDb>;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  await runMigrations(container.getConnectionUri());
  handle = createDb(container.getConnectionUri());
});

afterAll(async () => {
  await handle?.pool.end();
  await container?.stop();
});

async function seedHousehold(name: string) {
  const { db } = handle;
  const [household] = await db.insert(households).values({ name }).returning();
  const [guardian] = await db
    .insert(guardians)
    .values({ householdId: household!.id, authUid: `uid-${name}`, email: `${name}@example.com` })
    .returning();
  await db.insert(kids).values({ householdId: household!.id, nickname: "Ada", pinHash: "x" });
  await db.insert(devices).values({
    householdId: household!.id,
    label: "Kitchen tablet",
    tokenHash: `hash-${name}`,
    authorisedBy: guardian!.id,
  });
  await db.insert(auditLog).values({ householdId: household!.id, actor: "system", action: "seed" });
  return household!;
}

describe("schema", () => {
  it("applies migrations and defaults a new household to the UK free plan", async () => {
    const household = await seedHousehold("defaults");
    expect(household.timezone).toBe("Europe/London");
    expect(household.plan).toBe("free");
  });

  it("re-running migrations is a no-op", async () => {
    await expect(runMigrations(container.getConnectionUri())).resolves.toBeUndefined();
  });

  it("deleting a household erases all of its data", async () => {
    const { db } = handle;
    const keep = await seedHousehold("keep");
    const gone = await seedHousehold("gone");

    await db.delete(households).where(eq(households.id, gone.id));

    for (const table of [guardians, kids, devices, auditLog]) {
      expect(await db.select().from(table).where(eq(table.householdId, gone.id))).toHaveLength(0);
      expect(await db.select().from(table).where(eq(table.householdId, keep.id))).not.toHaveLength(
        0,
      );
    }
  });

  it("rejects kid nicknames that are empty or too long", async () => {
    const { db } = handle;
    const household = await seedHousehold("nicknames");
    await expect(
      db.insert(kids).values({ householdId: household.id, nickname: "", pinHash: "x" }),
    ).rejects.toThrow();
    await expect(
      db.insert(kids).values({ householdId: household.id, nickname: "x".repeat(25), pinHash: "x" }),
    ).rejects.toThrow();
  });
});
