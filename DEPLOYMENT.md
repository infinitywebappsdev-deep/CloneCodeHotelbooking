# Staging Deployment Guide

Applies to the Banky Hotel & Suites app (TanStack Start + Supabase/Lovable Cloud).
Read alongside [README.md](./README.md) and [TESTING.md](./TESTING.md).

---

## 1. Environments

| Environment | Frontend URL                                         | Database                    | Purpose     |
| ----------- | ---------------------------------------------------- | --------------------------- | ----------- |
| Local       | `http://localhost:8080`                              | local or staging Supabase   | development |
| Staging     | `project--<id>-dev.lovable.app` (stable preview URL) | staging Supabase project    | QA, UAT     |
| Production  | published Lovable URL / custom domain                | production Supabase project | live        |

Rules:

- Staging must use a **separate Supabase project** from production. Never point
  staging at live guest data.
- Frontend changes go live only after **Publish → Update**. Backend changes
  (migrations, server functions, API routes) deploy immediately on publish.
- The stable preview URL is immutable — use it when registering webhooks and
  cron jobs so renames never break integrations.

## 2. Required secrets

Set these on the staging environment before the first deploy. `.env.example`
lists the full set with example shapes.

| Secret                          | Where used | Required     | Notes                                   |
| ------------------------------- | ---------- | ------------ | --------------------------------------- |
| `SUPABASE_URL`                  | server     | yes          | injected by Lovable Cloud               |
| `SUPABASE_PUBLISHABLE_KEY`      | server     | yes          | anon-level, RLS applies                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | server     | yes          | bypasses RLS; admin + queue only        |
| `SUPABASE_ANON_KEY`             | server     | yes          | shared secret for the reminder endpoint |
| `VITE_SUPABASE_URL`             | browser    | yes          | build-time inlined                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser    | yes          | publishable, safe                       |
| `VITE_SUPABASE_PROJECT_ID`      | browser    | yes          | —                                       |
| `LOVABLE_API_KEY`               | server     | yes          | email + AI gateway; auto-provisioned    |
| `EMAIL_SENDER_DOMAIN`           | server     | for email    | verified delegated subdomain            |
| `FRONT_DESK_EMAIL`              | server     | optional     | internal copy of new bookings           |
| `VITE_WHATSAPP_NUMBER`          | browser    | optional     | overrides the default hotel number      |
| `VITE_PAYSTACK_PUBLIC_KEY`      | browser    | for payments | publishable key only                    |

Never store the Paystack **secret** key or the service-role key in a `VITE_`
variable — `bun run security` fails the pipeline if you do.

## 3. Deploy sequence (staging)

1. **Merge to the staging branch** and confirm CI is green
   (lint, typecheck, build, `bun audit`, Gitleaks, CodeQL, project rules).
2. **Apply database migrations first.** `supabase db push` against the staging
   project (or approve the migration in Lovable). Schema must lead code.
3. **Verify secrets** exist in the staging environment.
4. **Publish** the app. Backend routes deploy immediately; click Update for the
   frontend.
5. **Smoke test** using [TESTING.md](./TESTING.md) §1–§3.
6. **Regenerate types** if the schema changed and commit
   `src/integrations/supabase/types.ts`.

## 4. Email / SMTP configuration

Sending is handled by Lovable's managed email API (`@lovable.dev/email-js`) —
there is no SMTP host, port, or password to configure, and no queue table on
the provider side.

1. Configure the sender domain in **Cloud → Emails** and add the NS records
   shown there at your DNS provider. Wait for verification (up to 72 h).
2. Set `EMAIL_SENDER_DOMAIN` to the verified subdomain, e.g. `notify.bankyhotel.com`.
3. On staging, prefer a distinct subdomain (`notify-staging.…`) so staging
   bounces never affect production sender reputation.
4. Until a domain is verified, `notify.server.ts` logs and swallows sends —
   bookings still succeed, emails are skipped with reason `no_api_key` /
   delivery failure and stay retryable in the queue.
5. Suppression (bounces, complaints, unsubscribes) is enforced server-side by
   Lovable. Do not build app-side suppression lists.

If you must use a third-party SMTP provider instead, note the sender subdomain
delegated to Lovable cannot be verified by that provider simultaneously; use a
different subdomain.

## 5. Reminder scheduler (webhook / cron)

Endpoint: `POST https://project--<id>-dev.lovable.app/api/public/reminders`
Header: `apikey: <SUPABASE_ANON_KEY>` (401 otherwise).

Behaviour: enqueues arrival reminders (check-in tomorrow) and thank-you notes
(check-out yesterday), then works all due jobs. Retries use exponential backoff
(5 m → 20 m → 80 m → 320 m, capped 12 h) and dead-letter after 4 attempts;
staff requeue from **Admin → Reports → Reminder queue**. The response also
returns prepared WhatsApp links for the front desk.

Schedule it once daily, e.g. with `pg_cron` + `pg_net`:

```sql
select cron.schedule(
  'banky-reminders',
  '0 8 * * *',                       -- 08:00 UTC daily
  $$select net.http_post(
      url     := 'https://project--<id>-dev.lovable.app/api/public/reminders',
      headers := '{"apikey":"<SUPABASE_ANON_KEY>","Content-Type":"application/json"}'::jsonb,
      body    := '{}'::jsonb
    );$$
);
```

Any external scheduler (GitHub Actions cron, Upstash, cron-job.org) works the
same way. The endpoint is idempotent — one job per `(kind, reference)` — so a
duplicate run does not double-send.

### Email delivery events (optional)

To react to bounces/complaints/unsubscribes in app code, add
`src/routes/lovable/email/events.ts` using `createEmailWebhookHandler`. Hooks
register automatically at publish; events fire for production sends only.

## 6. WhatsApp configuration

WhatsApp is **link-based (`wa.me`)**, not the Business Cloud API — no token,
phone-number ID, or webhook is required.

- Default number lives in `src/lib/hotel.ts` (+234 703 690 5671) and can be
  overridden per environment with `VITE_WHATSAPP_NUMBER` or edited in
  **Admin → Branding**.
- Format: international, digits only, no `+` or spaces (`2347036905671`).
- Guest-facing links appear in the booking bar, reserve flow, guest portal and
  the WhatsApp FAB. Staff links are returned by the reminders endpoint.
- On staging, set a test number so real guests are never messaged during QA.

If you later migrate to the WhatsApp Business Cloud API, you will need
`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, a verified webhook route under
`src/routes/api/public/`, and message templates approved by Meta.

## 7. Payments (Paystack)

Staging uses `pk_test_…`. Configure the Paystack callback URL to the staging
preview URL. Verify a test transaction with a Paystack test card before
promoting.

## 8. Post-deploy verification

Run [TESTING.md](./TESTING.md) in full. Minimum gate before promoting staging
to production:

- [ ] Home, rooms, reserve pages render with live availability
- [ ] A test reservation creates a row and returns a reference
- [ ] Confirmation email logged as sent (or explicitly skipped, domain pending)
- [ ] `/admin` reachable by a staff user, blocked for a normal user
- [ ] `/my-stay` shows only the signed-in guest's bookings
- [ ] `POST /api/public/reminders` returns 200 with the key, 401 without
- [ ] CSV export downloads and opens correctly
- [ ] `bun run security` and `bun audit --audit-level=high` clean

## 9. Rollback

**Frontend / server code (fast, safe).**

1. In Lovable, open **History** (or the revert button under the relevant chat
   message) and select the last known-good version.
2. Publish again. Frontend needs **Update**; backend code redeploys on publish.
3. Outside Lovable: `git revert <sha>` on the deploy branch and let CI redeploy.
   Prefer `revert` over force-pushing so history stays auditable.

**Database (slower, plan it).** Migrations are forward-only — there is no
automatic down-migration.

1. Take a snapshot/backup before every schema change on staging _and_
   production.
2. To undo, author a **new compensating migration** (drop the added column,
   restore the prior policy) and apply it the normal way.
3. Only for destructive incidents: restore from the point-in-time backup, then
   re-apply migrations after the restore point.
4. Roll code back **before** the schema when the new code depends on new
   columns; roll schema back **after** code in all other cases.

**Emails already sent cannot be recalled.** If a bad deploy sent wrong
notifications, discard the remaining jobs in **Admin → Reports → Reminder
queue** first, then fix and requeue.

**Incident checklist.**

- [ ] Freeze further publishes
- [ ] Revert code to last-good version and publish
- [ ] Discard/park pending notification jobs if they are affected
- [ ] Apply a compensating migration if schema is implicated
- [ ] Re-run the smoke tests in §8
- [ ] Record cause and follow-up in the repo
