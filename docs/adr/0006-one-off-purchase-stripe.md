# 6. One-off purchase via Stripe, store-agnostic entitlements

- **Status:** Accepted
- **Date:** 2026-11-04 (planning)

## Context

Monetisation is a one-off unlock. The free tier is 2 kids, basic cosmetics and
2 weeks of the weekly boss. Native store builds will come later.

## Decision

Use Stripe Checkout for a one-time payment in GBP, with Stripe Tax for VAT,
only in the guardian area. Record unlocks in an `entitlement` table with a
`source` column (stripe / apple / google), so purchases from any channel unlock
every client.

## Consequences

- Implemented in M6. Store builds will add StoreKit / Play Billing.
- The card payment also gives strong evidence of parental consent.
