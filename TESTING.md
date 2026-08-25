# End-to-End Test Checklist

Run against **staging** with a fresh test guest account and a test staff
account. Tick every box before promoting to production.
Legend: **G** = guest/anonymous, **S** = staff/admin, **SQL** = run in the SQL editor.

---

## 0. Preflight

- [ ] `bun install && bun run lint && bun run typecheck && bun run build` all pass
- [ ] `bun run security` and `bun run security:deps` clean
- [ ] Staging secrets present (see DEPLOYMENT.md §2)
- [ ] Migrations applied: `supabase db push` reports nothing pending
- [ ] Two accounts ready: `staff@test…` (role `admin`) and `guest@test…` (no role)

## 1. Public site & reservation flow (G)

- [ ] `/` loads: video header, booking bar, no console errors
- [ ] `/rooms` lists published rooms only; unpublished rooms are absent
- [ ] `/rooms/<slug>` shows correct rate, gallery, amenities
- [ ] Booking bar with valid dates shows **live availability counts** matching
      `select * from room_availability('<in>','<out>')`
- [ ] Dates where a room is fully booked show it as unavailable / 0 left
- [ ] Check-out before check-in is rejected with a clear message
- [ ] `/reserve` computes nights × rate correctly; the **server** total in the
      created row matches the displayed total (tamper the client price and
      confirm the server value wins)
- [ ] Submitting a reservation returns a booking reference
- [ ] WhatsApp button opens `wa.me/<number>` with a prefilled message
- [ ] Paystack link opens with the correct amount (test key)
- [ ] Page metadata: unique title/description per route, single `<h1>`

## 2. Emails on submission

- [ ] Guest receives “Reservation received — <ref>” (or the log shows a skip
      because the sender domain is unverified)
- [ ] `FRONT_DESK_EMAIL` inbox receives the “New booking request” alert
- [ ] Marking the booking confirmed in admin sends “Your stay is confirmed”
- [ ] Re-triggering the same event does **not** duplicate the email
      (idempotency key per reference)
- [ ] Cloud → Emails shows the sends; suppressed/rate-limited entries appear in
      the email logs

## 3. Admin dashboard (S)

Access control

- [ ] Signed-out visit to `/admin` redirects to `/auth`
- [ ] Guest (no role) signing in and visiting `/admin` is blocked, not shown data
- [ ] Staff user reaches `/admin`; hard refresh keeps the session (no loop/flash)

Overview

- [ ] Occupancy %, revenue and today's arrivals/departures match SQL spot-checks
- [ ] Staff management adds/removes a role and the change takes effect on reload

Reservations

- [ ] The new test booking appears in the list
- [ ] Search by reference/guest name and each status filter return correct rows
- [ ] Opening a booking allows status change, payment status, internal notes
- [ ] Changes persist after refresh and `updated_at` advances
- [ ] Cancelling a booking frees its inventory in `room_availability`

Rooms

- [ ] Editing rate/description/units persists and is reflected on the public page
- [ ] Unpublishing a room removes it from `/rooms` and from availability results

Reports & export

- [ ] Revenue and room-night figures reconcile with the reservations list
- [ ] Date-range filter changes the totals as expected
- [ ] **CSV export** downloads, opens in a spreadsheet, has correct headers,
      row count matches the filtered view, and commas/quotes in guest names are
      escaped properly
- [ ] Export contains no unintended sensitive fields

CMS & branding

- [ ] Editing a page's copy shows in live preview, then publishes to the public site
- [ ] Adding/removing a gallery image updates `/gallery`
- [ ] Adding/reordering/deleting an FAQ updates `/faqs`
- [ ] Uploading a logo/favicon and changing colors updates header/footer
      site-wide **without a redeploy**
- [ ] Media upload goes to the `media` bucket via a signed URL

## 4. Guest portal `/my-stay` (G)

- [ ] Signed-out visit redirects to `/auth`
- [ ] Signed-in guest sees only bookings matching their own email/user id
- [ ] Guest A cannot see Guest B's booking (log in as each and compare)
- [ ] Booking detail shows room, dates, nights, total, status, reference
- [ ] Pay-now (Paystack) and WhatsApp quick links carry the right reference
- [ ] Sending a message to staff appears in the thread immediately
- [ ] Staff sees the message in admin and the reply appears for the guest
- [ ] A guest cannot post a message onto another guest's booking

## 5. Reminders & notification queue

- [ ] `POST /api/public/reminders` **without** the `apikey` header → `401`
- [ ] With a wrong key → `401`
- [ ] With the correct `SUPABASE_ANON_KEY` → `200`

```sh
curl -i -X POST "$BASE_URL/api/public/reminders" -H "apikey: $SUPABASE_ANON_KEY"
```

- [ ] Seed a reservation with `check_in = tomorrow` → run the endpoint → an
      `arrival_reminder` job exists in `notification_jobs`
- [ ] Seed one with `check_out = yesterday` → a `thank_you` job exists
- [ ] Running the endpoint twice creates **no duplicate** jobs (unique on
      `kind, reference`) and does not re-send a `sent` job
- [ ] Response includes prepared WhatsApp links for arriving guests
- [ ] Successful send flips the job to `sent` with `attempts` incremented
- [ ] Force a failure (invalid recipient) → job stays `pending`, `attempts` +1,
      `next_attempt_at` pushed out per backoff (5 m → 20 m → 80 m → 320 m)
- [ ] After `max_attempts` the job becomes `dead` and shows in
      **Reports → Reminder queue**
- [ ] **Requeue** on a dead job returns it to `pending` and it runs on the next pass
- [ ] **Discard** sets `discarded` and it never runs again
- [ ] **Run queue now** processes due jobs and reports a tally
- [ ] With `LOVABLE_API_KEY` absent the job defers ~1 h without burning attempts
- [ ] The scheduled cron/`pg_net` job fires (check `cron.job_run_details`)

## 6. RLS & authorization

Run each as the stated role. Anon = publishable key with no session.

| #   | Check                                                        | Expected                                         |
| --- | ------------------------------------------------------------ | ------------------------------------------------ |
| 1   | anon `select * from rooms`                                   | published rooms only                             |
| 2   | anon `select * from reservations`                            | 0 rows                                           |
| 3   | anon `insert into reservations` directly                     | denied (bookings go through the server function) |
| 4   | anon `select * from messages`                                | 0 rows                                           |
| 5   | anon `select * from user_roles`                              | denied / 0 rows                                  |
| 6   | anon `select * from notification_jobs`                       | denied / 0 rows                                  |
| 7   | guest `select * from reservations`                           | only their own                                   |
| 8   | guest `update` another guest's reservation                   | 0 rows affected                                  |
| 9   | guest `insert into user_roles (self, 'admin')`               | denied (no privilege escalation)                 |
| 10  | guest `update rooms` / `update pages`                        | denied                                           |
| 11  | staff `select * from reservations`                           | all rows                                         |
| 12  | staff `update rooms`, `update pages`, `update site_settings` | allowed                                          |
| 13  | staff `select/update notification_jobs`                      | allowed                                          |
| 14  | anon read of a `media` object                                | denied (private bucket)                          |
| 15  | staff upload/read in `media`                                 | allowed                                          |

Schema-level assertions (SQL):

- [ ] Every table in `public` has `rowsecurity = true`
      — `select relname, relrowsecurity from pg_class where relnamespace='public'::regnamespace and relkind='r';`
- [ ] Every table has at least one policy
      — `select tablename, count(*) from pg_policies where schemaname='public' group by 1;`
- [ ] Every `SECURITY DEFINER` function sets `search_path`
- [ ] `has_role` / `is_staff` are not executable by `PUBLIC` or `anon`
- [ ] Roles are stored **only** in `user_roles`, never on `profiles`
- [ ] `supabase--linter` reports no new errors

## 7. Regression sweep

- [ ] Every route renders on mobile (375 px) and desktop (1440 px)
- [ ] No console errors or failed network requests on any route
- [ ] Sign-out clears the session; protected routes redirect afterwards
- [ ] Google sign-in (if enabled) returns to a public callback and lands correctly
- [ ] Reload on `/admin/reservations` and `/my-stay` keeps the user signed in

## 8. Sign-off

| Item                 | Owner | Date | Result |
| -------------------- | ----- | ---- | ------ |
| Public + reservation |       |      |        |
| Emails               |       |      |        |
| Admin + exports      |       |      |        |
| Guest portal         |       |      |        |
| Reminders/queue      |       |      |        |
| RLS matrix           |       |      |        |
