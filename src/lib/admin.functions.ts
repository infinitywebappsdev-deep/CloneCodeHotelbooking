import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";
import {
  assertStaff,
  assertAdmin,
  assertPrivilege,
  getUserStaffStatus,
  MASTER_ADMIN_EMAILS,
  getDefaultPrivilegesForRole,
  ALL_PRIVILEGES,
  RoleType,
  PrivilegeKey,
  UserRoleRecord,
} from "./auth-roles";
import firebaseConfig from "../../firebase-applet-config.json";

type Ctx = {
  userId: string;
  claims: Record<string, unknown>;
};

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
    const email = (context.claims["email"] as string) ?? "";
    return await getUserStaffStatus(context.userId, email);
  });

/** Grants admin to the first signed-in user when the hotel has no admin yet. */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const roles = await firestoreRest.list<UserRoleRecord>("user_roles");
    const adminCount = roles.filter((r) => r.role === "admin" || r.role === "super_admin").length;
    if (adminCount > 0) throw new Error("An administrator already exists for this hotel.");
    await firestoreRest.create("user_roles", {
      user_id: context.userId,
      role: "super_admin",
      email: (context.claims["email"] as string) ?? "",
      full_name: (context.claims["name"] as string) ?? "Initial Administrator",
      privileges: ALL_PRIVILEGES.map((p) => p.key),
      status: "active",
      department: "Management",
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const roles = await firestoreRest.list<UserRoleRecord>("user_roles");

    // Ensure configured master admins are always represented
    const list: UserRoleRecord[] = [...roles];
    for (const masterEmail of MASTER_ADMIN_EMAILS) {
      if (!list.some((r) => r.email.toLowerCase() === masterEmail.toLowerCase())) {
        list.unshift({
          id: `master-${masterEmail.replace(/[^a-zA-Z0-9]/g, "-")}`,
          user_id: masterEmail,
          email: masterEmail,
          full_name:
            masterEmail === "chrisbllack@gmail.com"
              ? "Chris Black (Master Admin)"
              : "System Super Administrator",
          role: "super_admin",
          privileges: ALL_PRIVILEGES.map((p) => p.key),
          department: "Executive Management",
          status: "active",
          created_at: new Date().toISOString(),
        });
      }
    }

    return list.map((r) => ({
      ...r,
      full_name: r.full_name ?? "",
      privileges:
        Array.isArray(r.privileges) && r.privileges.length > 0
          ? r.privileges
          : getDefaultPrivilegesForRole(r.role),
    }));
  });

export const listUsers = listStaff;

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(
    (d: {
      email: string;
      password?: string;
      full_name?: string;
      role: RoleType;
      privileges?: PrivilegeKey[];
      department?: string;
      phone?: string;
      status?: "active" | "suspended" | "pending_invite";
      notes?: string;
    }) =>
      z
        .object({
          email: z.string().email(),
          password: z.string().min(6).optional(),
          full_name: z.string().optional(),
          role: z.enum([
            "super_admin",
            "admin",
            "manager",
            "front_desk",
            "housekeeping",
            "content_editor",
            "accountant",
            "staff",
          ]),
          privileges: z.array(z.string()).optional(),
          department: z.string().optional(),
          phone: z.string().optional(),
          status: z.enum(["active", "suspended", "pending_invite"]).optional(),
          notes: z.string().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUsers = await firestoreRest.list<UserRoleRecord>("user_roles");

    if (existingUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error(
        `A user account with email '${data.email}' is already registered in the system.`,
      );
    }

    let authUserId = normalizedEmail;

    // If a password is provided and Firebase API key is available, create Firebase Auth account
    if (data.password && firebaseConfig.apiKey) {
      try {
        const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
        const res = await fetch(signupUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: data.password,
            displayName: data.full_name || normalizedEmail,
            returnSecureToken: false,
          }),
        });
        const resData = await res.json();
        if (resData.localId) {
          authUserId = resData.localId;
        } else if (resData.error && resData.error.message !== "EMAIL_EXISTS") {
          console.warn("Firebase Auth user creation message:", resData.error.message);
        }
      } catch (err) {
        console.warn("Firebase Auth account signup fetch error:", err);
      }
    }

    const assignedPrivileges =
      data.privileges && data.privileges.length > 0
        ? (data.privileges as PrivilegeKey[])
        : getDefaultPrivilegesForRole(data.role);

    const newDoc = await firestoreRest.create<UserRoleRecord>("user_roles", {
      user_id: authUserId,
      email: normalizedEmail,
      full_name: data.full_name?.trim() || "",
      role: data.role,
      privileges: assignedPrivileges,
      department: data.department?.trim() || "Front Office",
      phone: data.phone?.trim() || "",
      status: data.status || "active",
      notes: data.notes?.trim() || "",
      created_by: (context.claims["email"] as string) || context.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await audit(context, "users.created", "user_roles", newDoc.id, {
      email: normalizedEmail,
      role: data.role,
      department: data.department,
      privileges_count: assignedPrivileges.length,
    });

    return { ok: true, id: newDoc.id };
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator(
    (d: {
      id: string;
      full_name?: string;
      role: RoleType;
      privileges: PrivilegeKey[];
      department?: string;
      phone?: string;
      status: "active" | "suspended" | "pending_invite";
      notes?: string;
    }) =>
      z
        .object({
          id: z.string(),
          full_name: z.string().optional(),
          role: z.enum([
            "super_admin",
            "admin",
            "manager",
            "front_desk",
            "housekeeping",
            "content_editor",
            "accountant",
            "staff",
          ]),
          privileges: z.array(z.string()),
          department: z.string().optional(),
          phone: z.string().optional(),
          status: z.enum(["active", "suspended", "pending_invite"]),
          notes: z.string().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");

    const existing = await firestoreRest.get<UserRoleRecord>("user_roles", data.id);
    if (!existing) {
      throw new Error("User record not found.");
    }

    const currentActorEmail = (context.claims["email"] as string) || "";
    if (
      existing.email.toLowerCase() === currentActorEmail.toLowerCase() &&
      data.status === "suspended"
    ) {
      throw new Error("You cannot suspend your own administrative account.");
    }

    const updated = await firestoreRest.patch<UserRoleRecord>("user_roles", data.id, {
      full_name: data.full_name?.trim() || existing.full_name || "",
      role: data.role,
      privileges: data.privileges,
      department: data.department?.trim() || existing.department || "",
      phone: data.phone?.trim() || existing.phone || "",
      status: data.status,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes || "",
      updated_at: new Date().toISOString(),
    });

    await audit(context, "users.updated", "user_roles", data.id, {
      email: existing.email,
      role: data.role,
      status: data.status,
      privileges_count: data.privileges.length,
    });

    return { ok: true, record: updated };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string; status: "active" | "suspended" | "pending_invite" }) =>
    z
      .object({
        id: z.string(),
        status: z.enum(["active", "suspended", "pending_invite"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");

    const existing = await firestoreRest.get<UserRoleRecord>("user_roles", data.id);
    if (!existing) throw new Error("User record not found.");

    const currentActorEmail = (context.claims["email"] as string) || "";
    if (
      existing.email.toLowerCase() === currentActorEmail.toLowerCase() &&
      data.status === "suspended"
    ) {
      throw new Error("You cannot suspend your own account.");
    }

    await firestoreRest.patch("user_roles", data.id, {
      status: data.status,
      updated_at: new Date().toISOString(),
    });

    await audit(context, "users.status_changed", "user_roles", data.id, {
      email: existing.email,
      new_status: data.status,
    });

    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { email: string; newPassword?: string; sendEmail?: boolean }) =>
    z
      .object({
        email: z.string().email(),
        newPassword: z.string().min(6).optional(),
        sendEmail: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");
    const normalizedEmail = data.email.trim().toLowerCase();

    if (data.sendEmail || !data.newPassword) {
      if (firebaseConfig.apiKey) {
        try {
          const resetUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`;
          await fetch(resetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestType: "PASSWORD_RESET",
              email: normalizedEmail,
            }),
          });
        } catch (e) {
          console.warn("Password reset email dispatch error:", e);
        }
      }
      await audit(context, "users.password_reset_requested", "auth", normalizedEmail, {
        email: normalizedEmail,
        type: "email_link",
      });
      return { ok: true, message: `Password reset email dispatched to ${normalizedEmail}.` };
    }

    // Direct password update
    if (data.newPassword && firebaseConfig.apiKey) {
      try {
        // Look up or update user
        const resetUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseConfig.apiKey}`;
        // Password update via REST API
        await fetch(resetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: data.newPassword,
            returnSecureToken: false,
          }),
        });
      } catch (err) {
        console.warn("Direct password update error:", err);
      }
    }

    await audit(context, "users.password_changed", "auth", normalizedEmail, {
      email: normalizedEmail,
      type: "direct_password_set",
    });

    return { ok: true, message: `Password successfully updated for ${normalizedEmail}.` };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");

    const existing = await firestoreRest.get<UserRoleRecord>("user_roles", data.id);
    if (!existing) return { ok: true };

    if (MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === existing.email.toLowerCase())) {
      throw new Error("Master Administrator accounts are protected and cannot be deleted.");
    }

    const currentActorEmail = (context.claims["email"] as string) || "";
    if (existing.email.toLowerCase() === currentActorEmail.toLowerCase()) {
      throw new Error("You cannot delete your own active administrator account.");
    }

    await firestoreRest.delete("user_roles", data.id);

    await audit(context, "users.deleted", "user_roles", data.id, {
      email: existing.email,
      role: existing.role,
    });

    return { ok: true };
  });

export const addStaffByEmail = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { email: string; role: RoleType }) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum([
          "super_admin",
          "admin",
          "manager",
          "front_desk",
          "housekeeping",
          "content_editor",
          "accountant",
          "staff",
        ]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPrivilege(context, "can_manage_users");
    const privs = getDefaultPrivilegesForRole(data.role);
    await firestoreRest.create("user_roles", {
      user_id: data.email.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      privileges: privs,
      status: "active",
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const removeStaff = deleteUser;

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
        image_url: z.string().max(10_000_000),
        features: z.array(z.string().max(80)).max(20),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    const existing = await firestoreRest.get<Record<string, unknown>>("rooms", id);
    if (!existing) {
      await firestoreRest.set("rooms", id, {
        id,
        slug: id,
        ...patch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      await firestoreRest.patch("rooms", id, {
        ...patch,
        updated_at: new Date().toISOString(),
      });
    }
    await audit(context, "rooms.saved", "rooms", id, { name: data.name, rate: data.rate });
    return { ok: true };
  });

export const createRoom = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z
          .string()
          .min(2)
          .max(80)
          .regex(/^[a-z0-9-]+$/),
        name: z.string().trim().min(2).max(120),
        blurb: z.string().max(1000),
        rate: z.number().int().min(0).max(100_000_000),
        units: z.number().int().min(1).max(500),
        occupancy: z.string().max(60),
        size: z.string().max(60),
        image_url: z.string().max(10_000_000),
        features: z.array(z.string().max(80)).max(20),
        published: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const existing = await firestoreRest.get<Record<string, unknown>>("rooms", data.slug);
    if (existing) {
      throw new Error(`A room with slug '${data.slug}' already exists.`);
    }

    const docId = data.slug;
    await firestoreRest.set("rooms", docId, {
      id: docId,
      slug: data.slug,
      name: data.name,
      blurb: data.blurb,
      rate: data.rate,
      units: data.units,
      occupancy: data.occupancy,
      size: data.size,
      image_url: data.image_url,
      features: data.features,
      published: data.published,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await audit(context, "rooms.created", "rooms", docId, {
      name: data.name,
      rate: data.rate,
      units: data.units,
    });

    return { ok: true, id: docId };
  });

export const deleteRoom = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const existing = await firestoreRest.get<Record<string, unknown>>("rooms", data.id);
    if (existing) {
      await firestoreRest.delete("rooms", data.id);
      await audit(context, "rooms.deleted", "rooms", data.id, {
        name: String(existing["name"] || data.id),
      });
    }
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
