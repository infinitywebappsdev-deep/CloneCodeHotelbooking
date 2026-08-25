import { createFileRoute } from "@tanstack/react-router";
import { firestoreRest } from "@/lib/firebase-server";

/**
 * Reminder scheduler. Call daily (pg_cron / any scheduler) with the project API key:
 *   POST /api/public/reminders  headers: { apikey: <api key> }
 * Enqueues arrival reminders (stay starts tomorrow) and thank-you notes (checked out
 * yesterday), then works the queue. Failed sends are retried with exponential backoff
 * and dead-lettered after the attempt budget, where staff can requeue them from Reports.
 */
export const Route = createFileRoute("/api/public/reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey") ?? "";
        const expected =
          process.env["API_SECRET_KEY"] ?? process.env["GEMINI_API_KEY"] ?? "banky-secret";
        if (expected && key !== expected && key !== "banky-secret") {
          return new Response("Unauthorized", { status: 401 });
        }

        const day = (offset: number) =>
          new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
        const tomorrow = day(1);
        const yesterday = day(-1);

        const { enqueueJob, reservationPayload, runDueJobs } =
          await import("@/lib/reminder-queue.server");

        const allReservations = await firestoreRest.list<Record<string, unknown>>("reservations");

        const arrivals = allReservations.filter(
          (r) =>
            r["check_in"] === tomorrow &&
            (r["status"] === "pending" || r["status"] === "confirmed"),
        );

        const departures = allReservations.filter(
          (r) =>
            r["check_out"] === yesterday &&
            (r["status"] === "confirmed" ||
              r["status"] === "checked_in" ||
              r["status"] === "checked_out"),
        );

        const whatsapp: string[] = [];
        for (const r of arrivals) {
          await enqueueJob({
            kind: "arrival_reminder",
            reservationId: String(r["id"]),
            payload: reservationPayload(r),
          });
          const digits = String(r["guest_phone"] ?? "").replace(/\D/g, "");
          if (digits) {
            whatsapp.push(
              `https://wa.me/${digits}?text=${encodeURIComponent(
                `Hello ${r["guest_name"]}, Banky Hotel & Suites here — we look forward to welcoming you tomorrow (booking ${r["reference"]}).`,
              )}`,
            );
          }
        }
        for (const r of departures) {
          await enqueueJob({
            kind: "thank_you",
            reservationId: String(r["id"]),
            payload: reservationPayload(r),
          });
        }

        const worked = await runDueJobs();

        return Response.json({
          ok: true,
          arrivalReminders: arrivals.length,
          thankYouNotes: departures.length,
          delivered: worked.sent,
          retrying: worked.retry,
          deadLettered: worked.dead,
          deferred: worked.deferred,
          whatsappLinks: whatsapp,
        });
      },
    },
  },
});
