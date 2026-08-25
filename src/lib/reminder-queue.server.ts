// Server-only reminder queue: durable jobs, automatic retries with backoff,
// and a dead-letter state that staff can requeue from the admin reports screen.
import type { ReservationEmailPayload } from "./notify.server";
import { firestoreRest } from "./firebase-server";

export type JobKind = "arrival_reminder" | "thank_you";

export type NotificationJob = {
  id: string;
  kind: JobKind;
  reservation_id: string | null;
  reference: string;
  recipient: string;
  payload: ReservationEmailPayload;
  status: "pending" | "sent" | "dead" | "discarded";
  attempts: number;
  max_attempts: number;
  last_error: string;
  next_attempt_at: string;
  created_at: string;
  updated_at: string;
};

/** Exponential backoff: 5m, 20m, 80m, 320m … capped at 12h. */
function backoffMinutes(attempt: number) {
  return Math.min(5 * 4 ** Math.max(attempt - 1, 0), 720);
}

export function reservationPayload(r: Record<string, unknown>): ReservationEmailPayload {
  return {
    reference: String(r["reference"] ?? ""),
    name: String(r["guest_name"] ?? ""),
    email: String(r["guest_email"] ?? ""),
    roomName: String(r["room_name"] ?? ""),
    checkIn: String(r["check_in"] ?? ""),
    checkOut: String(r["check_out"] ?? ""),
    nights: Number(r["nights"] ?? 0),
    total: Number(r["total"] ?? 0),
  };
}

/** Idempotent: one job per (kind, reservation reference). */
export async function enqueueJob(input: {
  kind: JobKind;
  reservationId: string | null;
  payload: ReservationEmailPayload;
}) {
  const jobId = `${input.kind}_${input.payload.reference.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const existing = await firestoreRest.get("notification_jobs", jobId);
  if (existing) return; // already queued or handled

  await firestoreRest.set("notification_jobs", jobId, {
    kind: input.kind,
    reservation_id: input.reservationId,
    reference: `${input.payload.reference}`,
    recipient: input.payload.email,
    payload: input.payload,
    status: "pending",
    attempts: 0,
    max_attempts: 5,
    last_error: "",
    next_attempt_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

async function deliver(job: NotificationJob) {
  const { notifyArrivalReminder, notifyThankYou } = await import("./notify.server");
  const send = job.kind === "thank_you" ? notifyThankYou : notifyArrivalReminder;
  return send(job.payload);
}

/**
 * Attempts one job. Returns the resulting status.
 * - transient failure  -> stays pending with exponential backoff
 * - attempts exhausted -> dead-letter (`dead`), requeueable by staff
 * - no email API key   -> left pending, retried in an hour, attempts untouched
 */
export async function runJob(job: NotificationJob) {
  const attempt = job.attempts + 1;
  let error = "";
  try {
    const result = await deliver(job);
    if (result.sent) {
      await firestoreRest.patch("notification_jobs", job.id, {
        status: "sent",
        attempts: attempt,
        last_error: "",
        updated_at: new Date().toISOString(),
      });
      return "sent" as const;
    }
    if (result.reason === "no_api_key") {
      await firestoreRest.patch("notification_jobs", job.id, {
        last_error: "Email sending is not configured yet.",
        next_attempt_at: new Date(Date.now() + 3_600_000).toISOString(),
        updated_at: new Date().toISOString(),
      });
      return "deferred" as const;
    }
    error = result.reason ?? "Unknown delivery failure";
  } catch (e) {
    error = (e as Error).message;
  }

  const exhausted = attempt >= (job.max_attempts || 5);
  await firestoreRest.patch("notification_jobs", job.id, {
    attempts: attempt,
    last_error: error.slice(0, 500),
    status: exhausted ? "dead" : "pending",
    next_attempt_at: new Date(Date.now() + backoffMinutes(attempt) * 60_000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  return exhausted ? ("dead" as const) : ("retry" as const);
}

/** Runs every job that is due. Safe to call repeatedly. */
export async function runDueJobs(limit = 50) {
  const allJobs = await firestoreRest.list<NotificationJob>("notification_jobs");
  const now = new Date().toISOString();
  const due = allJobs
    .filter((j) => j.status === "pending" && (!j.next_attempt_at || j.next_attempt_at <= now))
    .slice(0, limit);

  const tally = { sent: 0, retry: 0, dead: 0, deferred: 0 };
  for (const row of due) {
    const outcome = await runJob(row);
    tally[outcome] += 1;
  }
  return tally;
}
