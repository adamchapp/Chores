# 4. Parent-managed kid profiles with device + PIN

- **Status:** Accepted
- **Date:** 2026-11-04 (planning)

## Context

Kids need to sign in easily, but collecting their emails or credentials adds
legal risk and friction.

## Decision

Guardians own the account. Kid profiles hold only a nickname, avatar, optional
birth year and a PIN hash. A guardian authorises a device for kid mode; kids
pick their profile and enter their PIN. Kid sessions are issued by our API, not
an identity provider, so no kid data goes to a third party.

## Consequences

- Implemented in M1. The schema already has `kid.pin_hash` and `device.token_hash` (we store hashes only).
- PIN attempts need rate limiting and lockout. Devices can be revoked.
- Second guardian is deferred to v1.1. `guardian.role` exists so it's an additive change.
