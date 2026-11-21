/**
 * M0 schema: household, guardians, kid profiles, devices and audit log.
 * Chores, game and billing tables arrive in later milestones (docs/PLAN.md §3.3).
 *
 * Tenancy rule: every household-owned table has a non-null household_id
 * with ON DELETE CASCADE, so deleting a household erases all its data
 * (right to erasure, PLAN §5).
 */
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const householdPlan = pgEnum("household_plan", ["free", "full"]);
export const guardianRole = pgEnum("guardian_role", ["owner"]);

export const households = pgTable("household", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Europe/London"),
  plan: householdPlan("plan").notNull().default("free"),
  createdAt: createdAt(),
});

export const guardians = pgTable(
  "guardian",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    /** Identity Platform user id. */
    authUid: text("auth_uid").notNull(),
    email: text("email").notNull(),
    role: guardianRole("role").notNull().default("owner"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("guardian_auth_uid_idx").on(t.authUid),
    index("guardian_household_idx").on(t.householdId),
  ],
);

/** Kid profiles hold no contact details or real names (PLAN §5, data minimisation). */
export const kids = pgTable(
  "kid",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    avatar: jsonb("avatar").notNull().default({}),
    birthYear: integer("birth_year"),
    /** argon2id hash of the kid's PIN. Never store the PIN itself. */
    pinHash: text("pin_hash").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("kid_household_idx").on(t.householdId),
    check("kid_nickname_length", sql`char_length(${t.nickname}) between 1 and 24`),
    check(
      "kid_birth_year_range",
      sql`${t.birthYear} is null or ${t.birthYear} between 2000 and 2100`,
    ),
  ],
);

/** A device a guardian has authorised for kid mode. */
export const devices = pgTable(
  "device",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    /** SHA-256 of the device token; the token itself only lives on the device. */
    tokenHash: text("token_hash").notNull(),
    authorisedBy: uuid("authorised_by").references(() => guardians.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("device_token_hash_idx").on(t.tokenHash),
    index("device_household_idx").on(t.householdId),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    /** e.g. "guardian:<uuid>", "kid:<uuid>", "system". */
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    target: text("target"),
    detail: jsonb("detail"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_household_at_idx").on(t.householdId, t.at)],
);
