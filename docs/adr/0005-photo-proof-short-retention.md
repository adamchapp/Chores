# 5. Photo proof reviewed by a parent, short retention, no scanning in v1

- **Status:** Accepted
- **Date:** 2026-11-04 (planning)

## Context

Photo proof makes the game fair, but photos taken by children are the most
sensitive data we'll hold.

## Decision

Photos are taken in-app only, location data is stripped, they're stored in a
private bucket, and they're visible only to the household's guardians.
Guardians approve or reject; XP is awarded on approval. Photos are deleted 7
days after review, with a 30-day bucket rule as a backstop. No automated
content scanning in v1.

## Consequences

- The photos bucket (in `infra/modules/app`) enforces no public access, has soft delete **disabled** so deletions are final, and has the 30-day lifecycle rule.
- Revisit scanning before adding any sharing features.
