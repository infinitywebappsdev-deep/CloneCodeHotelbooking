// Server-only notification helpers.
// Emails go out through Lovable managed sending; if no sender domain is verified
// yet the attempt is logged and swallowed so a booking never fails because of email.
import { sendLovableEmail } from "@lovable.dev/email-js";

export type ReservationEmailPayload = {
  reference: string;
  name: string;
  email: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
};

const naira = (v: number) => `NGN ${v.toLocaleString("en-NG")}`;

function senderDomain() {
  return process.env["EMAIL_SENDER_DOMAIN"] ?? "";
}

function fromAddress() {
  const domain = senderDomain();
  return domain
    ? `Banky Hotel & Suites <reservations@${domain}>`
    : "Banky Hotel & Suites <reservations@bankyhotelandsuites.com>";
}

function shell(title: string, intro: string, payload: ReservationEmailPayload, outro: string) {
  const rows: [string, string][] = [
    ["Reference", payload.reference],
    ["Room", payload.roomName],
    ["Arrival", payload.checkIn],
    ["Departure", payload.checkOut],
    ["Nights", String(payload.nights)],
    ["Total", naira(payload.total)],
  ];
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;color:#1f2a24">
    <h1 style="font-weight:400;font-size:26px;margin:0 0 8px">${title}</h1>
    <p style="font-size:15px;line-height:1.6">${intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#6b7a72">${k}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${v}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-size:14px;line-height:1.6;color:#6b7a72">${outro}</p>
    <p style="font-size:13px;color:#9aa8a1;margin-top:28px">Banky Hotel &amp; Suites, Ado-Ekiti, Ekiti State, Nigeria</p>
  </div>`;
  const text = `${title}\n\n${intro.replace(/<[^>]+>/g, "")}\n\n${rows
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n\n${outro.replace(/<[^>]+>/g, "")}`;
  return { html, text };
}

async function trySend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.info(`[email] skipped ${input.label} -> ${input.to}: no API key`);
    return { sent: false as const, reason: "no_api_key" };
  }
  try {
    const result = await sendLovableEmail(
      {
        to: input.to,
        from: fromAddress(),
        ...(senderDomain() ? { sender_domain: senderDomain() } : {}),
        subject: input.subject,
        html: input.html,
        text: input.text,
        label: input.label,
        purpose: "transactional",
        idempotency_key: input.idempotencyKey,
      },
      { apiKey, idempotencyKey: input.idempotencyKey },
    );
    console.info(`[email] sent ${input.label} -> ${input.to}`, result.message_id ?? "");
    return { sent: true as const, id: result.message_id };
  } catch (error) {
    console.warn(`[email] failed ${input.label} -> ${input.to}:`, (error as Error).message);
    return { sent: false as const, reason: (error as Error).message };
  }
}

export async function notifyReservationReceived(payload: ReservationEmailPayload) {
  const body = shell(
    "We have your request",
    `Dear ${payload.name}, thank you for choosing Banky Hotel &amp; Suites. Your reservation request has been received and our front desk will confirm it shortly.`,
    payload,
    "Need anything sooner? Reply to this email or message us on WhatsApp at +234 704 700 4816.",
  );
  const guest = await trySend({
    to: payload.email,
    subject: `Reservation received — ${payload.reference}`,
    ...body,
    label: "booking-received",
    idempotencyKey: `received-${payload.reference}`,
  });

  const desk = process.env["FRONT_DESK_EMAIL"];
  if (desk) {
    const alert = shell(
      "New booking request",
      `${payload.name} (${payload.email}) just requested a room on the website.`,
      payload,
      "Open the admin dashboard to confirm or decline this booking.",
    );
    await trySend({
      to: desk,
      subject: `New booking ${payload.reference} — ${payload.roomName}`,
      ...alert,
      label: "desk-alert",
      idempotencyKey: `desk-${payload.reference}`,
    });
  }
  return guest;
}

export async function notifyReservationConfirmed(payload: ReservationEmailPayload) {
  const body = shell(
    "Your stay is confirmed",
    `Dear ${payload.name}, we are delighted to confirm your reservation. Check-in is from 2:00 PM and check-out is 12:00 PM.`,
    payload,
    "We look forward to welcoming you to Ado-Ekiti.",
  );
  return trySend({
    to: payload.email,
    subject: `Confirmed — ${payload.reference}`,
    ...body,
    label: "booking-confirmed",
    idempotencyKey: `confirmed-${payload.reference}`,
  });
}

export async function notifyArrivalReminder(payload: ReservationEmailPayload) {
  const body = shell(
    "See you tomorrow",
    `Dear ${payload.name}, this is a gentle reminder that your stay begins tomorrow. Our reception is open 24 hours.`,
    payload,
    "Let us know your arrival time and we will have everything ready.",
  );
  return trySend({
    to: payload.email,
    subject: `Arriving tomorrow — ${payload.reference}`,
    ...body,
    label: "arrival-reminder",
    idempotencyKey: `reminder-${payload.reference}`,
  });
}

export async function notifyThankYou(payload: ReservationEmailPayload) {
  const body = shell(
    "Thank you for staying with us",
    `Dear ${payload.name}, thank you for choosing Banky Hotel &amp; Suites. We hope your stay was restful.`,
    payload,
    "We would love to welcome you back — reply to this email for a returning-guest rate.",
  );
  return trySend({
    to: payload.email,
    subject: `Thank you — ${payload.reference}`,
    ...body,
    label: "thank-you",
    idempotencyKey: `thanks-${payload.reference}`,
  });
}
