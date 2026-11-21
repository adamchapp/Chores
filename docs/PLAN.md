# Chores — Product & Technical Plan (v1)

> Status: **Draft for review** · Last updated: 2026-11-04

A mobile-first web app (PWA) that turns household chores into a family RPG.
Parents set chores; kids complete them, submit photo proof, and earn XP and
coins that level up their avatar, buy cosmetics, and help the family defeat
a weekly boss.

---

## 1. Decisions so far

| Area                | Decision                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Audience            | Families: parents/guardians + kids (including under-13s)                                       |
| Ambition            | Public product, open sign-up                                                                   |
| Platform            | Mobile-friendly installable web app (PWA)                                                      |
| Game style          | Avatar/RPG progression + points & leaderboard                                                  |
| RPG depth           | Medium: avatar, levels, cosmetics, **quests & weekly team boss**                               |
| Kid login           | Parent-managed profiles, unlocked with a PIN or picture password on a parent-authorised device |
| Verification        | Photo proof → parent reviews → reward awarded on approval                                      |
| Monetisation        | One-off purchase (parent-only, web checkout)                                                   |
| v1 extras           | Recurring chores & rotation, push notifications, offline support                               |
| Stack               | TypeScript full-stack, Postgres                                                                |
| Cloud               | Google Cloud, region `europe-west2` (London)                                                   |
| Launch market       | **UK first** (en-GB, GBP, UK GDPR + Children's Code). US/EU later                              |
| Free tier           | 1 household, up to 2 kids, basic cosmetics, 2 weeks of the weekly boss                         |
| App stores          | PWA first; **wrap for iOS/Android later** (designed for it from day one, see §3.5)             |
| Deferred to post-v1 | Second guardian, custom real-life rewards, automated photo safety scanning                     |

---

## 2. Requirements

### 2.1 Personas

- **Guardian (parent):** creates the household, manages kids, defines chores and
  rewards, reviews photo submissions, and buys the full version. Adult account
  with email login.
- **Kid:** a profile owned by the household, with no email and no personal data
  beyond a nickname, avatar and an optional birth year. Does chores and plays
  the game.

### 2.2 Functional requirements (v1)

**Household & accounts**

- F1. A guardian signs up (email + password or Google/Apple sign-in) and creates a household.
- F2. A guardian adds kid profiles (nickname, avatar, optional birth year, 4-digit PIN or picture password).
- F3. A guardian authorises a device for kid mode. Kids switch profiles on that device with their PIN.

**Chores**

- F5. A guardian creates a chore: title, icon, difficulty (XP value), photo required (default on), due time.
- F6. Recurrence: one-off, daily, specific weekdays, weekly, or monthly (RRULE subset).
- F7. Assignment: a specific kid, **rotation** between selected kids, or "anyone" (first to claim it).
- F8. A kid sees **Today** and **This week** lists and marks a chore done, attaching a photo taken in-app.
- F9. A guardian sees an **approval queue**, approves or rejects (with an optional reason from preset choices), and can bulk-approve.
- F10. Rejected chores go back to the kid to retry, with partial XP if the guardian chooses.

**Game**

- F11. Approved chores award **XP** (levels) and **coins** (currency).
- F12. Avatar customisation: base avatar plus unlockable outfits, accessories and pets bought with coins or unlocked by level.
- F13. **Weekly boss:** the household fights a boss whose HP is scaled to the week's scheduled chores. Each approved chore deals damage. Defeating it gives every kid a reward chest. The boss resets each Monday.
- F14. **Quests:** short goals ("Make your bed 5 days in a row", "Help a sibling"), giving bonus XP/coins and badges.
- F15. **Leaderboard:** weekly household ranking by XP. Also shows a "personal best" view so younger siblings aren't always last (see §6).
- F16. Streaks for daily consistency.

**Notifications**

- F17. Web Push to kids for chore reminders, to guardians for "photo awaiting review", and for "boss defeated!".
- F18. Guardians set quiet hours, and kid notifications are off by default outside them.

**Offline**

- F19. Kids can view chores, mark them done and take photos while offline. Submissions queue up and sync automatically.
- F20. The UI clearly shows "waiting to sync" and never shows XP as awarded until the server confirms.

**Purchase**

- F21. Free tier: 1 household, up to 2 kids, basic avatar set, boss feature included as a teaser (e.g. the first 2 weeks).
- F22. One-off purchase unlocks: unlimited kids, full cosmetic catalogue, all quests/bosses. Priced in GBP, VAT-inclusive (UK 20% VAT via Stripe Tax).
- F23. Purchases happen only in the guardian area, behind a re-authentication prompt.

**Account & data**

- F24. A guardian can export all household data and delete the household (hard delete within 30 days).

### 2.3 Non-functional requirements

- **Child privacy & safety (critical):** UK GDPR / Data Protection Act 2018 and the ICO Age Appropriate Design Code (Children's Code) for launch. Design so COPPA (US) and EU GDPR Art. 8 can be added later without rework. See §5.
- **Performance:** kid-mode screens interactive in < 2s on a mid-range Android over 4G. Lighthouse PWA/perf ≥ 90.
- **Availability:** 99.5% target. Offline mode covers short outages for kids.
- **Accessibility:** WCAG 2.2 AA. Large tap targets, icon + text labels, works for early readers.
- **Security:** OWASP ASVS L2 for the guardian area. Strict per-household tenant isolation.
- **Cost:** under about $50/month at launch scale (scales to zero where possible).
- **i18n-ready:** strings, dates and currency externalised from day one; ship en-GB first.
- **Data residency:** all personal data stored and processed in the UK (`europe-west2`).

### 2.4 Out of scope for v1

- Native app store apps (the PWA can be wrapped later with Capacitor/TWA)
- Real-money allowance and bank integrations
- Chat or any free-text messaging between users
- Cross-household / public leaderboards
- Deep RPG (stats, battles, inventory crafting)
- Second guardian / co-parent invites and separated households (v1.1 candidate; schema keeps `guardian.role` so this is additive)
- Custom real-life rewards (e.g. coins → screen time)
- Automated photo safety scanning (see §5 for the v1 mitigations)
- Native store-wrapped builds (planned next, see §3.5)
- Markets outside the UK

---

## 3. High-level architecture

```
                ┌──────────────────────────────────────────────┐
  Phone/Tablet  │  PWA (Next.js, React)                        │
  (kid/guardian)│  - Service worker (Workbox): app shell cache │
                │  - IndexedDB outbox for offline submissions  │
                │  - Web Push subscription                     │
                └───────────────┬──────────────────────────────┘
                                │ HTTPS (tRPC/REST, JSON)
                ┌───────────────▼──────────────────────────────┐
  Cloud Run     │  web: Next.js (SSR + API route handlers)     │
                │  - Auth (guardian sessions, kid device tokens)│
                │  - Domain services (chores, game, billing)   │
                └──┬──────────┬──────────────┬────────────┬────┘
                   │          │              │            │
          ┌────────▼───┐ ┌────▼───────┐ ┌────▼─────┐ ┌────▼────────┐
          │ Cloud SQL  │ │ Cloud      │ │ Cloud    │ │ Stripe      │
          │ Postgres   │ │ Storage    │ │ Tasks    │ │ Checkout +  │
          │            │ │ (photos,   │ │          │ │ webhooks    │
          └────────────┘ │ private,   │ └────┬─────┘ └─────────────┘
                         │ signed URL)│      │
                         └────────────┘ ┌────▼──────────────────────┐
                                        │ worker: Cloud Run service │
          Cloud Scheduler ─────────────►│ - generate chore instances│
          (cron)                        │ - rotation & boss reset   │
                                        │ - push notification fanout│
                                        │ - photo retention purge   │
                                        └───────────────────────────┘
```

### 3.1 Tech choices

| Concern        | Choice                                                                                           | Why                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Monorepo       | pnpm workspaces + Turborepo                                                                      | Shared types/domain logic between web and worker                                     |
| Frontend       | Next.js (App Router), React, Tailwind, Workbox                                                   | PWA support, SSR for guardian pages, large ecosystem                                 |
| Game rendering | React + SVG/CSS layered avatars; Framer Motion for effects                                       | Light enough for medium RPG; no game engine needed                                   |
| API            | tRPC (internal) inside Next.js route handlers; Zod validation                                    | End-to-end types; can split into its own service later                               |
| DB / ORM       | Cloud SQL Postgres 16 + Drizzle ORM                                                              | SQL-first, good migrations, typed                                                    |
| Guardian auth  | Google Identity Platform (Firebase Auth)                                                         | GCP-native; email, Google, Apple sign-in, MFA                                        |
| Kid auth       | Own implementation: guardian-authorised device token + per-kid PIN → short-lived kid session JWT | No kid PII sent to any third party                                                   |
| Photos         | Cloud Storage private bucket, direct upload via signed URL, EXIF stripped, lifecycle delete      | Cheap; keeps the app server out of the upload path                                   |
| Jobs           | Cloud Scheduler → Cloud Tasks → worker service                                                   | Retries, idempotency, scales to zero                                                 |
| Push           | Web Push (VAPID) via `web-push`                                                                  | Standard; works on Android and on iOS 16.4+ for installed PWAs                       |
| Payments       | Stripe Checkout (one-time payment, GBP) + Stripe Tax + webhook → `entitlement`                   | Simple one-off purchase; card payment also gives strong evidence of parental consent |
| Infra as code  | Terraform                                                                                        | Repeatable envs                                                                      |
| Observability  | Cloud Logging, Error Reporting, Cloud Trace (OpenTelemetry)                                      | No third-party analytics SDKs on kid screens                                         |

### 3.2 Repository layout

```
chores/
  apps/
    web/            Next.js PWA (guardian + kid UI, API route handlers)
    worker/         Background job service (Node, Fastify, thin)
  packages/
    domain/         Pure TS: recurrence, rotation, XP/levels, boss, quests (no I/O)
    db/             Drizzle schema, migrations, repositories
    api/            tRPC routers and authz middleware
    ui/             Shared components, avatar renderer
    config/         eslint, tsconfig, tailwind presets
  infra/            Terraform (envs: dev, staging, prod)
  e2e/              Playwright tests
  docs/             This plan, ADRs, privacy notes
```

**Key principle:** all game and scheduling rules live in `packages/domain` as
pure, deterministic functions. That makes them easy to test exhaustively and
reusable on the client for optimistic UI.

### 3.3 Core data model (first cut)

```
household(id, name, timezone, plan, created_at)
guardian(id, household_id, auth_uid, email, role[owner])   -- member role added in v1.1
kid(id, household_id, nickname, avatar_json, birth_year?, pin_hash)
device(id, household_id, label, token_hash, authorised_by, revoked_at)

chore_template(id, household_id, title, icon, xp, coins, photo_required,
               rrule, assignment_mode[fixed|rotation|anyone],
               assignee_ids[], rotation_cursor, active)
chore_instance(id, template_id, household_id, assignee_kid_id?, due_at,
               status[open|submitted|approved|rejected|missed])
submission(id, instance_id, kid_id, client_id UUID UNIQUE, photo_key,
           submitted_at, reviewed_by?, reviewed_at?, decision, reason)

ledger_entry(id, kid_id, kind[xp|coins], amount, source_type, source_id,
             created_at)                  -- append-only; balances derived
kid_progress(kid_id, xp_total, level, coins_balance, streak)  -- projection

item(id, slot, rarity, price_coins, unlock_level, premium)
inventory(kid_id, item_id, acquired_at)
boss_week(id, household_id, week_start, boss_def_id, max_hp, hp, defeated_at)
quest_def(...) / quest_progress(kid_id, quest_def_id, progress, completed_at)
push_subscription(id, owner_type, owner_id, transport[webpush|fcm|apns],
                  endpoint, keys, created_at)
entitlement(household_id, sku, source[stripe|apple|google], external_ref,
            granted_at, revoked_at?)   -- store-agnostic for later app wrapping
audit_log(id, household_id, actor, action, target, at)
```

- **Tenant isolation:** every row carries `household_id`. All repository
  methods require it, and Postgres Row-Level Security acts as a second
  safeguard.
- **Ledger:** XP and coins are append-only ledger entries, so the system is
  auditable and reversible (e.g. a guardian un-approves a chore).

### 3.4 Key flows

**Chore submission (offline-capable)**

1. The kid taps "Done" and takes a photo. The client creates a `client_id` (UUID)
   and stores `{instance_id, client_id, photo blob}` in the IndexedDB outbox.
2. When online, the service worker uses Background Sync where available, and
   otherwise retries on app focus:
   a. request a signed upload URL → PUT photo to GCS
   b. `submitChore({instance_id, client_id, photo_key})`. **Idempotent** on `client_id`.
3. The server checks that the instance is still open and assigned to the kid (or is "anyone" and unclaimed). The first valid submission wins and others get a clear "already done by X" result.
4. The worker sends a push notification to guardians.

**Approval**

- A guardian approves → in one transaction: update submission, set instance
  `approved`, insert ledger entries, apply boss damage, update quest progress,
  and write the audit log. Then push "+25 XP!" to the kid device.

**Recurring generation & rotation**

- An hourly job (per household timezone) materialises chore instances for the
  next 7 days from templates. It is idempotent on `(template_id, due_at)`.
  Rotation moves the cursor forward deterministically per occurrence.

**Weekly boss**

- On Monday 00:00 local time: close last week's boss and grant chests if it was
  defeated. Create the new boss with `max_hp = Σ xp of scheduled instances × 0.8`,
  so a family that does most of its chores wins.

### 3.5 Designing for app-store wrapping later

The PWA ships first, but these choices keep the later move to iOS/Android cheap:

- **Wrapper:** Capacitor for iOS and Android (TWA is an Android-only alternative). The same Next.js build is served or bundled. Avoid web-only APIs that have no Capacitor equivalent.
- **Platform adapters:** put camera, push, storage and purchases behind small interfaces in `packages/ui/platform` (web implementation now, native later).
- **Push:** Web Push now; the `push_subscription` table has a `transport[webpush|fcm|apns]` column so native tokens slot in.
- **Purchases:** entitlements are store-agnostic (`source` column). Store builds will need in-app purchase (StoreKit / Play Billing, e.g. via RevenueCat) for the unlock. Store rules on linking to web checkout change often, so check them when wrapping. A household that bought on the web keeps its unlock in every client.
- **Store kids-category rules:** Apple's Kids Category and Google Play Families policy ban third-party analytics/ads and require parental gates. The privacy design in §5 already meets this, so keep it that way.
- **Auth:** Identity Platform supports native Google/Apple sign-in, so guardian accounts carry over.

---

## 4. Game design notes (v1)

- **Two currencies:** XP (never spent, drives level) and coins (spent on cosmetics).
- **Level curve:** `xp_for_level(n) = 50 * n^1.5`, tuned so a kid doing 3 to 4 chores a day levels up about weekly at first and slower later.
- **Boss:** team-based on purpose, so it's cooperative rather than only competitive. 8 to 12 boss designs at launch, rotating.
- **Leaderboard fairness:** default ranking is by **% of own assigned chores completed**, not raw XP, so age gaps between siblings matter less. Guardians can switch to raw XP.
- **No dark patterns:** no loot-box paid randomness, no real-money spending from kid mode, no FOMO countdown timers aimed at kids. Reward chests are earned only.
- **Content:** all cosmetic art is original (commissioned or generated with clear licensing), stored as layered SVG.

---

## 5. Child privacy, safety & compliance (UK launch)

This is the highest-risk area for a kids product. **Get a UK privacy lawyer
to review before public launch**, and register with the ICO (data protection
fee).

**Legal frame for launch:** UK GDPR + Data Protection Act 2018, the ICO
**Age Appropriate Design Code** (Children's Code, 15 standards), and the
Online Safety Act where it applies (v1 has no user-to-user communication
outside a household, which keeps exposure low; confirm with counsel).

- **Lawful basis & parental consent:** the UK age of digital consent is 13. For
  under-13 kid profiles, the guardian gives consent and we make "reasonable
  efforts" to check they're an adult: account email verification plus an
  adult check at kid-profile creation. The card payment for the full version is
  stronger evidence. Record consent and its version in `audit_log`.
- **Children's Code by design:**
  - _High privacy by default:_ no geolocation, no profiling, notifications off for kids outside guardian-set hours.
  - _Data minimisation:_ kid profiles store only nickname, avatar config, optional birth year and a PIN hash. No kid email, real name, location or contacts.
  - _Transparency & parental controls:_ kid mode clearly shows that a grown-up sees their photos ("Your grown-up will check this photo"), with a kid-readable privacy summary.
  - _No nudge techniques:_ no streak-loss guilt prompts, no countdown pressure, no paid randomness (see §4).
  - _DPIA_ completed before launch and kept updated.
- **Photos (most sensitive data). No automated scanning in v1, so mitigate with design:**
  - Taken in-app only (no gallery upload).
  - Client resizes them and strips EXIF/GPS. The server re-strips with `sharp` to be safe.
  - Private bucket in `europe-west2`, short-lived signed URLs, visible only to that household's guardians. Never shown to other kids or outside the household.
  - **Auto-deleted 7 days after review** (configurable down to "on approval"). GCS lifecycle rule as a backstop at 30 days.
  - Guardians can delete any photo immediately. Revisit automated scanning before adding any sharing features.
- **No third-party trackers, ads or analytics SDKs** anywhere in kid mode. Analytics are first-party and aggregate only.
- **No user-to-user communication** in v1.
- **Rights:** subject access/export and erasure for guardians. Documented retention schedule.
- **Security:** PINs hashed with argon2id and rate-limited with lockout. Device tokens can be revoked. Guardian actions in kid mode require guardian re-auth (also serves as the store "parental gate" later).
- **Documents needed:** privacy notice (kid-readable summary + full), terms, DPIA, retention schedule, subprocessors list (Google Cloud, Stripe, Identity Platform), ICO registration, cookie notice (essential cookies only).
- **Later markets:** US needs COPPA verifiable parental consent and an updated notice; EU needs per-country consent ages (13–16). The consent model is designed to be configurable per market.

---

## 6. Testing strategy

| Layer             | Tooling                                                                                                          | What                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain unit       | Vitest + fast-check (property tests)                                                                             | Recurrence/RRULE expansion across DST and timezones, rotation fairness, XP/level curve, boss HP, quest progress, idempotency rules. Target ~100% coverage of `packages/domain`.                                         |
| DB / repository   | Vitest + Testcontainers (Postgres 16)                                                                            | Migrations apply cleanly; RLS blocks cross-household access; ledger projections stay consistent.                                                                                                                        |
| API / authz       | Vitest against tRPC callers                                                                                      | **Authorisation matrix:** kid can't approve, kid can't see other kids' photos, guardian A can't touch household B, revoked device is rejected. Run on every PR.                                                         |
| Component         | Vitest + Testing Library; Storybook for UI and avatar states                                                     | Kid and guardian components, avatar rendering.                                                                                                                                                                          |
| E2E               | Playwright (mobile Chrome + WebKit emulation, `en-GB` locale, `Europe/London` timezone incl. BST/GMT changeover) | Golden paths: sign up → add kid → create recurring chore → kid submits photo → guardian approves → XP/boss update. **Offline test:** set context offline, submit, go online, assert sync. Push via mocked push service. |
| Accessibility     | axe-core in Playwright                                                                                           | No serious violations on every page.                                                                                                                                                                                    |
| PWA/perf          | Lighthouse CI                                                                                                    | Perf/PWA/a11y budgets enforced in CI.                                                                                                                                                                                   |
| Payments          | Stripe test mode + `stripe-cli` webhook replay                                                                   | Entitlement granting, GBP/VAT amounts, refunds, idempotent webhooks.                                                                                                                                                    |
| Load (pre-launch) | k6                                                                                                               | Approval and submission endpoints, Monday boss-reset spike.                                                                                                                                                             |
| Security          | Dependabot, CodeQL, `npm audit`, OWASP ZAP baseline against staging                                              | Pre-launch pen test focused on tenant isolation and photo access.                                                                                                                                                       |

**CI gates on PR:** typecheck, lint, unit + integration + authz tests,
build, Playwright smoke on a preview environment, Lighthouse budgets.

---

## 7. Deployment & operations

**Environments**

- All environments run in `europe-west2` (London).
- `dev`: one GCP project. Per-PR preview deploys as Cloud Run revisions with tags (`pr-123---web-xyz.run.app`) against a shared dev DB with seeded data.
- `staging`: its own GCP project, prod-like, Stripe test mode.
- `prod`: its own GCP project, Stripe live mode.

**Pipeline (GitHub Actions)**

1. PR → CI gates (above) → build container → push to Artifact Registry → deploy preview revision → Playwright smoke.
2. Merge to `main` → deploy to **staging** automatically → run migrations as a Cloud Run Job → full E2E suite.
3. Tag release `vX.Y.Z` → manual approval → **prod**: migrations job → deploy new revision with **no traffic** → smoke → gradual traffic shift (10% → 100%), with automatic rollback on error-rate alerts.

- Auth from GitHub to GCP via **Workload Identity Federation** (no service account keys).
- Secrets in **Secret Manager** (Stripe keys, VAPID keys, DB creds).
- **Migrations:** expand/contract pattern only, so old and new revisions can run against the same schema during rollout.
- **Infra:** Terraform in `infra/`, `plan` on PR, `apply` on merge, state in a GCS bucket.
- **Backups:** Cloud SQL automated daily backups + PITR, quarterly restore drill.
- **Monitoring:** uptime checks, SLO on API error rate/latency, alerts to email/Slack, job failure alerts (missed boss reset = bad Monday).

**Estimated launch cost:** Cloud SQL (smallest shared-core) ~$10–30/mo, Cloud Run
scales to zero ~$0–10, GCS/Tasks/Scheduler negligible. Total roughly $20–50/mo.

---

## 8. Milestones

| #    | Milestone                       | Contents                                                                                                                      |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| M0   | Foundations (1 wk)              | Monorepo, CI, Terraform dev env, Cloud Run hello-world, DB + migrations, ADRs                                                 |
| M1   | Core loop (2–3 wks)             | Guardian auth, household, kid profiles + device/PIN, one-off chores, photo submit, approval queue, XP/levels                  |
| M2   | Recurrence & rotation (1–2 wks) | RRULE engine, rotation, worker + scheduler, Today/Week views                                                                  |
| M3   | Offline + PWA (1–2 wks)         | Service worker, outbox, background sync, installability, offline E2E                                                          |
| M4   | Game layer (2–3 wks)            | Avatar renderer, cosmetics shop, coins, weekly boss, quests, leaderboard, streaks                                             |
| M5   | Notifications (1 wk)            | Web Push, quiet hours, preferences                                                                                            |
| M6   | Purchase & free tier (1 wk)     | Stripe Checkout (GBP, Stripe Tax), store-agnostic entitlements, free-tier gating (2 kids, basic cosmetics, 2-week boss trial) |
| M7   | Launch readiness (2 wks)        | DPIA, UK privacy docs + legal review, ICO registration, data export/delete, a11y pass, load test, pen test, staging → prod    |
| Beta | Closed UK beta                  | 10–20 UK families, feedback, tuning of XP curve and boss HP                                                                   |
| Next | Post-v1                         | Capacitor store builds + in-app purchase; second guardian; real-life rewards; photo scanning review; US/EU expansion          |

---

## 9. Decisions log & open questions

**Resolved (2026-11-04)**

- Free tier: 2 kids, basic cosmetics, 2 weeks of the boss. ✅
- Custom real-life rewards: not in v1.
- Second guardian: not in v1 (v1.1 candidate).
- Automated photo safety scanning: not in v1; mitigated by design (§5).
- Launch market: UK first.
- App stores: wrap later; architecture prepared (§3.5).

**Still open**

1. **Price point** for the one-off unlock (e.g. £4.99 vs £9.99).
2. **Art direction:** who produces avatar/boss art, and in what style?
3. **Brand name:** "Chores" is the working name. Check UK trademarks (UKIPO) before launch.
4. **Adult check method** at kid-profile creation: is email verification plus a simple adult confirmation enough for counsel, or do we need something stronger for the free tier?
