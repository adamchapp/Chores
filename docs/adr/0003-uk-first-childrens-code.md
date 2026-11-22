# 3. UK-first launch, Children's Code as the compliance baseline

- **Status:** Accepted
- **Date:** 2026-11-04 (planning)

## Context

The product is for families with children, including under-13s. Child data
protection rules differ by market.

## Decision

Launch in the UK first, under UK GDPR, the Data Protection Act 2018 and the ICO
Age Appropriate Design Code. All personal data is stored in `europe-west2`
(London). The consent model is designed so US (COPPA) and EU rules can be added
later without rework.

## Consequences

- High privacy by default, data minimisation, no third-party trackers in kid mode, no nudge techniques.
- A DPIA, legal review and ICO registration are needed before launch (M7).
- en-GB copy, GBP pricing, UK VAT from the start.
