# 12. Pure domain package; append-only XP/coin ledger

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

Game rules (levels, rotation, boss HP, quests, recurrence) are where subtle bugs
would upset kids and parents. Rewards must be auditable and reversible, for
example when a guardian un-approves a chore.

## Decision

- All game and scheduling rules live in `packages/domain` as pure, deterministic functions with no I/O. They're tested with unit tests and property-based tests (fast-check). Started with the level curve, chore rotation and boss HP/damage.
- XP and coins will be stored as an **append-only ledger** (`ledger_entry`) with balances derived from it (M1/M4).

## Consequences

- Rules can be reused on the client for optimistic UI while offline.
- Reversals are new ledger entries, never edits, so every point is traceable.
