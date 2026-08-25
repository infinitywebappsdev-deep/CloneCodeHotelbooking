This turns the current marketing site into a running hotel system. It needs Lovable Cloud (database, logins, server code, email) — I'll enable it as the first step.

## 1. Foundation — Lovable Cloud + data model

Tables (all with row-level security):

- `rooms` — the 8 categories: name, slug, description, rate, size, capacity, amenities, images, total units, sort order. Editable from the admin dashboard.
- `room_units` — individual physical rooms tied to a category (28 total), so availability is counted per unit.
- `reservations` — guest name, phone, email, room category, check-in/out, guests, nights, total price, status (pending / confirmed / checked-in / checked-out / cancelled), source, notes, payment status.
- `messages` — thread between a guest and staff, tied to a reservation.
- `profiles` + `user_roles` — staff/admin roles kept in a separate table (never on the profile) so roles can't be self-granted.
- `pages`, `gallery_images`, `faqs` — CMS content.
- `rates` — optional date-range overrides (weekend/festive pricing).

Public visitors can read rooms, gallery, FAQs, pages. Guests can only read their own reservation and messages. Only staff/admin can read all reservations or write content.

## 2. Live availability + reservation flow

- A server-side availability check counts booked units per category for the requested dates and returns real availability and the live price for that stay.
- The booking bar and each room page show "3 of 7 left for these dates" and the calculated total before the guest submits.
- Submitting creates a real `reservations` row (status pending), then offers WhatsApp handoff and the Paystack link. Double-booking is prevented server-side, not just in the UI.

## 3. Admin dashboard (`/admin`, staff login required)

- Today at a glance: arrivals, departures, in-house, occupancy, revenue.
- Reservations table: filter by status/date/room, open a reservation, change status, edit dates, add internal notes, reply to guest messages.
- Rooms manager: edit names, descriptions, rates, amenities, photos, unit counts.
- Reports: date-range export to CSV (bookings, revenue by room type, occupancy) plus on-screen charts.

## 4. Guest portal (`/my-stay`)

- Guests sign in by email (magic link) and see their bookings: dates, room, price, status, payment state.
- A message thread with the front desk on each booking; staff reply from the admin dashboard.
- Guests can request changes or cancellation, which raises a flag for staff.

## 5. CMS

- `/admin/content`: edit page copy (About, Dining, Events, Contact), upload/reorder/delete gallery images, add/edit/reorder FAQs.
- The public pages read from the database, so changes appear immediately with no redeploy.

## 6. Automated confirmations and reminders

- Email: on submission the guest gets a booking-received email, and a confirmation once staff confirm; the front desk gets a new-booking alert. Requires an email domain you own — I'll walk you through that when we get there.
- WhatsApp: a one-tap prefilled confirmation for staff immediately, plus a "send now" action in the dashboard for each booking. Fully automatic outbound WhatsApp needs a WhatsApp Business API account (Twilio or Meta) — if you have one I'll wire it; otherwise the assisted flow works from day one.
- Reminders: a scheduled job emails a pre-arrival reminder 24h before check-in and a thank-you after checkout.

## Technical notes

Data access goes through TanStack Start server functions; admin routes sit behind an `_authenticated` gate with an admin role check enforced in the database, not the browser. Existing pages keep their design — they just read live data instead of the hardcoded file. Reports export as CSV. Scheduled reminders run via a secured public endpoint triggered on a schedule.

## Suggested order

1. Cloud + schema + seed the 8 room types and 28 units, public pages read from the DB
2. Live availability + real reservations
3. Admin dashboard (reservations, rooms, reports)
4. Guest portal + messaging
5. CMS
6. Email/WhatsApp automation + reminders

That's a lot for one pass — I'd ship steps 1–3 first so you can take and manage real bookings, then continue. Say go and I'll start, or tell me to reorder.
