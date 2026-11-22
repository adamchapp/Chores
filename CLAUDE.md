# Notes for Claude

- pnpm + Turborepo monorepo. Run checks from the root: `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, `pnpm test:integration` (needs Docker), `pnpm build`, `pnpm format:check`.
- Game and scheduling rules belong in `packages/domain` as pure functions with
  unit and property (fast-check) tests. No I/O there.
- Every household-owned table has `household_id` (non-null, cascade delete).
  Always scope queries by household.
- Schema changes: edit `packages/db/src/schema.ts`, run `pnpm db:generate`, give the
  migration a descriptive name (rename the file and its `tag` in `drizzle/meta/_journal.json`).
  Migrations must be expand/contract safe.
- Kids' data is minimal by design (UK Children's Code): never add contact
  details, real names, location or third-party trackers for kids.
- TypeScript is pinned to 6.0 until typescript-eslint supports 7 (ADR 0013).
- Architecture decisions live in `docs/adr`. Add a new ADR for significant changes.
