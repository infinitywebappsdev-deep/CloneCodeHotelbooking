# Production Deployment Guide

Banky Hotel & Suites — TanStack Start + Lovable Cloud (Supabase).
Companion docs: [DEPLOYMENT.md](./DEPLOYMENT.md) (staging), [README.md](./README.md),
[TESTING.md](./TESTING.md), [SECURITY.md](./SECURITY.md).

Golden rule: **nothing reaches production that has not run green on staging
with the same migration files.**

---

## 1. Release preconditions

Do not start a production deploy unless every box is ticked.

- [ ] CI green on the release commit: lint, `bun run typecheck`, build,
      `bun audit --audit-level=high`, Gitleaks, CodeQL, `bun run security`
- [ ] The same migration files were applied on staging and QA'd there
- [ ] [TESTING.md](./TESTING.md) run on staging, including the RLS matrix
- [ ] Production secrets verified present (§2)
- [ ] A fresh database backup/snapshot exists and its timestamp is recorded
- [ ] Release window agreed — avoid check-in peaks (14:00–20:00 WAT) and the
      08:00 UTC reminder cron
- [ ] A named person is on point for rollback for 60 minutes after deploy

Record the release: commit SHA, migration filenames, backup timestamp,
deployer, start time.

## 2. Production secrets

Same names as staging (see DEPLOYMENT.md §2), production values:

| Secret                                                            | Production-specific note                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` | production project only                                            |
| `SUPABASE_SERVICE_ROLE_KEY`                                       | never in a `VITE_` var, never logged                               |
| `VITE_SUPABASE_*`                                                 | build-time inlined — rebuild after any change                      |
| `LOVABLE_API_KEY`                                                 | provisioned automatically; rotate via the rotate tool, not by hand |
| `EMAIL_SENDER_DOMAIN`                                             | the **verified production** subdomain, not the staging one         |
| `FRONT_DESK_EMAIL`                                                | real front-desk inbox                                              |
| `VITE_WHATSAPP_NUMBER`                                            | the real hotel number (`2347036905671`)                            |
| `VITE_PAYSTACK_PUBLIC_KEY`                                        | live `pk_live_…` key                                               |

Changing a `VITE_*` value requires a new publish; server secrets take effect on
the next request.

## 3. Safe database migration strategy

Migrations are **forward-only**. There is no automatic down-migration, so the
strategy is to make every schema change backward-compatible with the currently
running code.

### 3.1 Expand → migrate → contract

Never combine a schema change and a destructive change in one release.

| Phase    | Release             | What it does                                                             | Old code still works?                 |
| -------- | ------------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| Expand   | N                   | Add nullable columns / new tables / new policies / new indexes           | yes                                   |
| Migrate  | N                   | Deploy code that writes both old and new shapes, reads new with fallback | yes                                   |
| Backfill | N (async)           | Batched update of existing rows                                          | yes                                   |
| Contract | N+1 (later release) | Drop old column/policy once nothing reads it                             | old code breaks — that's why it waits |

Concretely for this app:

- Adding a field to `reservations`: ship it `NULL`-able (or with a default) in
  release N; make it `NOT NULL` only in release N+1 after backfill.
- Renaming a column: add the new one, dual-write in server functions, backfill,
  drop the old one a release later. Never `ALTER … RENAME` in one shot.
- Changing an RLS policy: `CREATE POLICY` the new one first, verify, then
  `DROP POLICY` the old one. A window with both is safe; a window with neither
  locks guests out.
- New public table: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` →
  `CREATE POLICY`, all in the same migration. A table without GRANTs is broken
  at runtime even with correct RLS.

### 3.2 Migration authoring rules

- One logical change per migration file; keep them small and reviewable.
- Idempotent guards where sensible: `IF NOT EXISTS`, `CREATE OR REPLACE`,
  `DROP POLICY IF EXISTS`.
- Wrap multi-statement logic so it applies atomically; a half-applied migration
  is the worst state to debug.
- Use validation **triggers**, not `CHECK` constraints, for time-dependent rules
  (`expire_at > now()` breaks restores).
- Add indexes `CONCURRENTLY` when the table is large and hot
  (`reservations`, `messages`, `notification_jobs`).
- Avoid long `ACCESS EXCLUSIVE` locks: set a short `lock_timeout` and retry
  rather than queueing behind a lock and stalling the booking flow.
- Every migration that creates a public table must be re-read for GRANTs before
  it is submitted.

### 3.3 Backfills

- Batch in chunks (e.g. 500–2000 rows) with a short pause; never a single
  `UPDATE` over the whole table.
- Backfills are re-runnable: filter on `WHERE new_col IS NULL`.
- Run them after the expand migration is live and verified, not inside it.

### 3.4 Ordering with code

- **Additive schema change** → apply schema **first**, then publish code.
- **Destructive/contract change** → publish code **first** (so nothing reads the
  old shape), then apply schema.
- Regenerate and commit `src/integrations/supabase/types.ts` after any schema
  change, then re-run typecheck before publishing.

## 4. Deploy sequence

1. **Freeze**: announce the window; no other publishes.
2. **Backup**: take the production snapshot; record the timestamp.
3. **Pause the reminder cron** if the release touches `reservations`,
   `notification_jobs`, or `notify.server.ts`:
   `select cron.unschedule('banky-reminders');`
4. **Drain the queue**: run **Admin → Reports → Reminder queue → Run due jobs**
   so nothing is mid-flight, and note any dead-lettered jobs.
5. **Apply migrations** (expand phase only) against production.
6. **Publish** the app. Backend routes/server functions deploy immediately;
   click **Update** for the frontend.
7. **Verify** — §5, all of it.
8. **Backfill** if the release needs one; verify counts.
9. **Re-enable the cron** with the original schedule and confirm one manual run
   returns 200.
10. **Unfreeze** and record the release outcome.

## 5. Post-deploy verification

Run within 15 minutes of publish. Any failure → go to §6.

**Health and build**

- [ ] Production URL returns 200; no console errors on `/`
- [ ] `/rooms`, `/reserve`, `/gallery`, `/contact` render; images and logo load
- [ ] Head metadata correct (title, description, og tags) on public routes

**Data path**

- [ ] Live availability shows real counts for a future date range
- [ ] A test reservation on a real room creates a row and returns a reference
- [ ] Server-recomputed `nights`, `rate`, and `total` match the quoted price
- [ ] Delete/cancel the test reservation afterwards and note it in the log

**Notifications**

- [ ] Booking confirmation email delivered to a real inbox (check spam)
- [ ] `notification_jobs` shows the job as `sent`, not `pending`/`dead`
- [ ] `POST /api/public/reminders` → 200 with `apikey`, 401 without
- [ ] WhatsApp link opens the correct production number

**Access control (must all pass)**

- [ ] `/admin` loads for a staff account
- [ ] `/admin` redirects/blocks a non-staff signed-in account
- [ ] `/my-stay` shows only the signed-in guest's reservations
- [ ] Anonymous read of `reservations` / `messages` / `notification_jobs`
      returns no rows
- [ ] CMS edit saves and appears on the public page without redeploy

**Reports and exports**

- [ ] Occupancy/revenue figures are non-zero and plausible
- [ ] CSV export downloads and opens with correct columns

**Ops**

- [ ] Cron re-scheduled and its next run time is correct
- [ ] Error logs clean for 10 minutes after publish
- [ ] `bun run security` clean on the released commit

## 6. Rollback procedure

Decide fast. If the booking flow, `/admin`, or auth is broken, roll back first
and diagnose afterwards.

### 6.1 Code rollback (minutes, always safe when schema is additive)

1. Freeze publishes.
2. Lovable **History** → select the last known-good version → **Publish**
   (frontend needs **Update**; backend redeploys automatically).
   Outside Lovable: `git revert <sha>` on the deploy branch and let CI ship it.
   Never force-push.
3. Re-run §5 health and data-path checks.

Because expand-phase migrations are backward-compatible, the previous code runs
unchanged against the new schema — this is the whole point of §3.1 and should
cover most incidents.

### 6.2 Schema rollback (compensating migration)

Only when the schema itself is the fault.

1. Author a **new** migration that undoes the change (drop the added column,
   restore the previous policy definition, drop the new index). Do not edit or
   delete the original migration file.
2. Apply it, regenerate types, publish.
3. If the bad migration dropped or rewrote data, a compensating migration cannot
   bring it back — go to §6.3.

### 6.3 Restore from backup (last resort, data loss window)

1. Declare an incident; put the site in a maintenance state if possible.
2. Restore the snapshot recorded in §4 step 2 (or point-in-time to just before
   the deploy).
3. Everything written after the restore point is lost — reservations taken in
   that window must be re-entered manually from confirmation emails and
   WhatsApp threads.
4. Re-apply any migrations that legitimately belong after the restore point.
5. Reconcile `notification_jobs`: discard duplicates before re-running the queue
   so guests are not messaged twice.

### 6.4 Notification-specific rollback

Sent emails and WhatsApp messages **cannot be recalled**.

1. `select cron.unschedule('banky-reminders');` immediately.
2. **Admin → Reports → Reminder queue** → discard affected pending/dead jobs.
3. Fix, verify on staging, then requeue selectively.
4. If wrong messages went out, send a correction from the front desk.

### 6.5 Incident checklist

- [ ] Publishes frozen, incident owner named
- [ ] Reminder cron unscheduled
- [ ] Code reverted to last-good and published
- [ ] Compensating migration applied (if schema implicated)
- [ ] Pending notification jobs discarded/parked
- [ ] §5 verification re-run and green
- [ ] Cron re-enabled
- [ ] Post-mortem written: cause, blast radius, prevention

## 7. Rollback decision table

| Symptom                                | Action                                           |
| -------------------------------------- | ------------------------------------------------ |
| UI broken, data fine                   | §6.1 code rollback                               |
| Server function 500s                   | §6.1 code rollback                               |
| Guests see others' data / RLS hole     | Revoke the policy immediately, then §6.1 + §6.2  |
| New column wrong / policy wrong        | §6.2 compensating migration                      |
| Data deleted or corrupted by migration | §6.3 restore                                     |
| Duplicate or wrong notifications       | §6.4                                             |
| Cron firing at the wrong time          | Unschedule, re-schedule, no code rollback needed |

## 8. Post-release

- Watch error logs and the reminder queue for 24 hours.
- Confirm the next scheduled cron run completed and jobs moved to `sent`.
- Schedule the **contract** migration (§3.1) for a later release; track it so
  the temporary dual-write code does not become permanent.
- Update this guide whenever the deploy shape changes.
