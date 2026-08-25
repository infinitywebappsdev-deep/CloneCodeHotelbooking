import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";

type Ctx = {
  userId: string;
  claims: Record<string, unknown>;
};

async function assertStaff(context: Ctx) {
  // In Firebase, check user_roles collection or claims
  const roles = await firestoreRest.list<{ user_id: string; role: string }>("user_roles");
  const userRoles = roles.filter((r) => r.user_id === context.userId).map((r) => r.role);
  if (!userRoles.includes("admin") && !userRoles.includes("staff")) {
    // If no roles exist yet at all in the database, allow bootstrap
    if (roles.length === 0) return;
    throw new Error("Forbidden: staff access only.");
  }
}

async function audit(
  context: Ctx,
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  await firestoreRest.create("audit_logs", {
    actor_id: context.userId,
    actor_email: (context.claims?.["email"] as string) ?? "",
    action,
    entity,
    entity_id: entityId,
    details,
    created_at: new Date().toISOString(),
  });
}

export const getStaffStatus = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const roles = await firestoreRest.list<{ id: string; user_id: string; role: string }>(
      "user_roles",
    );
    const userRoles = roles.filter((r) => r.user_id === context.userId).map((r) => r.role);
    const adminCount = roles.filter((r) => r.role === "admin").length;
    return {
      isStaff: userRoles.includes("admin") || userRoles.includes("staff") || roles.length === 0,
      isAdmin: userRoles.includes("admin") || roles.length === 0,
      canBootstrap: adminCount === 0,
      email: (context.claims["email"] as string) ?? "",
    };
  });

/** Grants admin to the first signed-in user when the hotel has no admin yet. */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const roles = await firestoreRest.list<{ id: string; user_id: string; role: string }>(
      "user_roles",
    );
    const adminCount = roles.filter((r) => r.role === "admin").length;
    if (adminCount > 0) throw new Error("An administrator already exists for this hotel.");
    await firestoreRest.create("user_roles", {
      user_id: context.userId,
      role: "admin",
      email: (context.claims["email"] as string) ?? "",
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const roles = await firestoreRest.list<{
      id: string;
      user_id: string;
      role: string;
      email?: string;
      full_name?: string;
    }>("user_roles");
    return roles.map((r) => ({
      ...r,
      email: r.email ?? "",
      full_name: r.full_name ?? "",
    }));
  });

export const addStaffByEmail = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { email: string; role: "admin" | "staff" }) =>
    z.object({ email: z.string().email(), role: z.enum(["admin", "staff"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.create("user_roles", {
      user_id: data.email, // using email as ID placeholder until they sign in
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("user_roles", data.id);
    return { ok: true };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const today = new Date().toISOString().slice(0, 10);
    const reservations = await firestoreRest.list<Record<string, unknown>>("reservations");
    const rows = (reservations ?? []).sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
    const active = rows.filter((r) =>
      ["pending", "confirmed", "checked_in"].includes(String(r["status"])),
    );
    const rooms = await firestoreRest.list<{ units: number }>("rooms");
    const totalUnits = (rooms ?? []).reduce((sum: number, r) => sum + Number(r.units || 0), 0);
    const inHouse = rows.filter(
      (r) =>
        r["status"] === "checked_in" ||
        (r["status"] === "confirmed" &&
          String(r["check_in"]) <= today &&
          String(r["check_out"]) > today),
    );
    const messages = await firestoreRest.list<{ sender: string; read_by_staff: boolean }>(
      "messages",
    );
    const unread = messages.filter((m) => m.sender === "guest" && !m.read_by_staff).length;

    return {
      arrivals: active.filter((r) => r["check_in"] === today),
      departures: active.filter((r) => r["check_out"] === today),
      pending: rows.filter((r) => r["status"] === "pending"),
      recent: rows.slice(0, 8),
      inHouseCount: inHouse.length,
      totalUnits,
      occupancy: totalUnits ? Math.round((inHouse.length / totalUnits) * 100) : 0,
      revenueMonth: rows
        .filter(
          (r) =>
            r["status"] !== "cancelled" && String(r["check_in"]).slice(0, 7) === today.slice(0, 7),
        )
        .reduce((sum: number, r) => sum + Number(r["total"] || 0), 0),
      unreadMessages: unread,
    };
  });

export const adminReservations = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { status?: string; from?: string; to?: string; q?: string } | undefined) =>
    z
      .object({
        status: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        q: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let rows = await firestoreRest.list<Record<string, unknown>>("reservations");
    if (data.status && data.status !== "all") {
      rows = rows.filter((r) => r["status"] === data.status);
    }
    if (data.from) {
      rows = rows.filter((r) => String(r["check_in"]) >= data.from!);
    }
    if (data.to) {
      rows = rows.filter((r) => String(r["check_in"]) <= data.to!);
    }
    if (data.q) {
      const q = data.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          String(r["guest_name"] ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r["reference"] ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r["guest_email"] ?? "")
            .toLowerCase()
            .includes(q),
      );
    }
    return rows.sort((a, b) =>
      String(b["check_in"] ?? "").localeCompare(String(a["check_in"] ?? "")),
    );
  });

export const updateReservation = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string(),
        status: z
          .enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"])
          .optional(),
        payment_status: z.enum(["unpaid", "part_paid", "paid", "refunded"]).optional(),
        staff_notes: z.string().max(2000).optional(),
        check_in: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        check_out: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    const updates = { ...patch } as Record<string, unknown>;

    if (patch.check_in && patch.check_out) {
      const nights = Math.round(
        (new Date(patch.check_out).getTime() - new Date(patch.check_in).getTime()) / 86_400_000,
      );
      if (nights < 1) throw new Error("Departure must be after arrival.");
      const existing = await firestoreRest.get<Record<string, unknown>>("reservations", id);
      updates["nights"] = nights;
      updates["total"] = nights * Number(existing?.["rate"] ?? 0);
    }
    updates["updated_at"] = new Date().toISOString();
    const updated = await firestoreRest.patch<Record<string, unknown>>("reservations", id, updates);

    if (patch.status === "confirmed" && updated) {
      const { notifyReservationConfirmed } = await import("./notify.server");
      await notifyReservationConfirmed({
        reference: String(updated["reference"]),
        name: String(updated["guest_name"]),
        email: String(updated["guest_email"]),
        roomName: String(updated["room_name"]),
        checkIn: String(updated["check_in"]),
        checkOut: String(updated["check_out"]),
        nights: Number(updated["nights"]),
        total: Number(updated["total"]),
      });
    }
    return updated;
  });

export const adminRooms = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const rooms = await firestoreRest.list<Record<string, unknown>>("rooms");
    if (rooms.length === 0) {
      const { ROOMS } = await import("./hotel");
      return ROOMS.map((r, idx) => ({
        id: r.slug,
        slug: r.slug,
        name: r.name,
        rate: r.rate,
        units: r.qty,
        occupancy: r.occupancy,
        size: r.size,
        image_url: r.image,
        blurb: r.blurb,
        features: r.features,
        sort_order: idx,
        published: true,
      }));
    }
    return rooms.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
  });

export const saveRoom = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string(),
        name: z.string().trim().min(2).max(120),
        blurb: z.string().max(1000),
        rate: z.number().int().min(0).max(100_000_000),
        units: z.number().int().min(0).max(500),
        occupancy: z.string().max(60),
        size: z.string().max(60),
        image_url: z.string().max(500),
        features: z.array(z.string().max(80)).max(12),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    await firestoreRest.patch("rooms", id, {
      ...patch,
      updated_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const adminThread = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { reservationId: string }) =>
    z.object({ reservationId: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const messages = await firestoreRest.list<Record<string, unknown>>("messages");
    const thread = messages.filter((m) => m["reservation_id"] === data.reservationId);
    thread.sort((a, b) =>
      String(a["created_at"] || "").localeCompare(String(b["created_at"] || "")),
    );

    for (const m of thread) {
      if (m["sender"] === "guest" && !m["read_by_staff"]) {
        await firestoreRest.patch("messages", String(m["id"]), { read_by_staff: true });
      }
    }
    return thread;
  });

export const staffReply = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ reservationId: z.string(), body: z.string().trim().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.create("messages", {
      reservation_id: data.reservationId,
      sender: "staff",
      author_id: context.userId,
      body: data.body,
      read_by_staff: true,
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const reportRows = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { from: string; to: string }) =>
    z.object({ from: z.string(), to: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const reservations = await firestoreRest.list<Record<string, unknown>>("reservations");
    const filtered = reservations.filter(
      (r) => String(r["check_in"]) >= data.from && String(r["check_in"]) <= data.to,
    );
    return filtered.sort((a, b) => String(a["check_in"]).localeCompare(String(b["check_in"])));
  });

/** Reminder queue: everything still waiting plus the dead-letter list. */
export const notificationJobs = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const jobs = await firestoreRest.list<Record<string, unknown>>("notification_jobs");
    const active = jobs.filter((j) => j["status"] === "pending" || j["status"] === "dead");
    return active.sort((a, b) =>
      String(a["next_attempt_at"] || "").localeCompare(String(b["next_attempt_at"] || "")),
    );
  });

/** Puts a failed reminder back on the queue and tries it immediately. */
export const requeueNotificationJob = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const job = await firestoreRest.patch<Record<string, unknown>>("notification_jobs", data.id, {
      status: "pending",
      attempts: 0,
      last_error: "",
      next_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const { runJob } = await import("./reminder-queue.server");
    const outcome = await runJob(job as never);
    await audit(context, "reminders.requeued", "notification_jobs", data.id, { outcome });
    return { outcome };
  });

/** Drops a reminder that should never be sent (duplicate, cancelled stay, bad email). */
export const discardNotificationJob = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.patch("notification_jobs", data.id, {
      status: "discarded",
      updated_at: new Date().toISOString(),
    });
    await audit(context, "reminders.discarded", "notification_jobs", data.id);
    return { ok: true };
  });

/** Runs every reminder that is due right now (manual "retry all"). */
export const runReminderQueue = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { runDueJobs } = await import("./reminder-queue.server");
    const result = await runDueJobs();
    await audit(context, "reminders.queue_run", "notification_jobs", "", result as never);
    return result;
  });
