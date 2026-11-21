# 2. PWA first, wrap for app stores later

- **Status:** Accepted
- **Date:** 2026-11-04 (planning)

## Context

Families use a mix of phones and tablets. One codebase is needed to ship fast,
but app store presence will matter later.

## Decision

Ship an installable PWA first. Wrap it later with Capacitor for iOS and Android.
Put camera, push, storage and purchases behind small platform interfaces so
native versions can be added without rewriting features (PLAN §3.5).

## Consequences

- Fast iteration, no store review in v1. On iOS, web push only works once the PWA is installed to the home screen.
- Native builds will need in-app purchase for the unlock (see ADR 0006).
- Avoid web APIs with no Capacitor equivalent.
