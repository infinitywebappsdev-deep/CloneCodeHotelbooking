import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";

export const myReservations = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims["email"] as string) ?? "";
    const all = await firestoreRest.list<Record<string, unknown>>("reservations");
    const mine = all.filter(
      (r) =>
        r["user_id"] === context.userId ||
        (email && String(r["guest_email"] ?? "").toLowerCase() === email.toLowerCase()),
    );
    return mine.sort((a, b) =>
      String(b["check_in"] ?? "").localeCompare(String(a["check_in"] ?? "")),
    );
  });

export const myThread = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { reservationId: string }) =>
    z.object({ reservationId: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const messages = await firestoreRest.list<Record<string, unknown>>("messages");
    const thread = messages.filter((m) => m["reservation_id"] === data.reservationId);
    return thread.sort((a, b) =>
      String(a["created_at"] ?? "").localeCompare(String(b["created_at"] ?? "")),
    );
  });

export const guestMessage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ reservationId: z.string(), body: z.string().trim().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await firestoreRest.create("messages", {
      reservation_id: data.reservationId,
      sender: "guest",
      author_id: context.userId,
      body: data.body,
      read_by_staff: false,
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const requestChange = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        reservationId: z.string(),
        kind: z.enum(["change", "cancel"]),
        note: z.string().max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const body =
      data.kind === "cancel"
        ? `Cancellation request: ${data.note || "no reason given"}`
        : `Change request: ${data.note}`;
    await firestoreRest.create("messages", {
      reservation_id: data.reservationId,
      sender: "guest",
      author_id: context.userId,
      body,
      read_by_staff: false,
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });
