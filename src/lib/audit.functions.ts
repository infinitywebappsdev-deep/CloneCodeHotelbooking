import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";
import { assertStaff } from "./auth-roles";

/** Actions the browser is allowed to record itself (everything else is logged server-side). */
const CLIENT_ACTIONS = [
  "auth.login",
  "auth.logout",
  "auth.password_changed",
  "auth.password_reset_requested",
  "export.reservations_csv",
  "export.report_bookings_csv",
  "export.report_rooms_csv",
] as const;

export const recordAuditEvent = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        action: z.enum(CLIENT_ACTIONS),
        entity: z.string().max(60).default(""),
        entityId: z.string().max(120).default(""),
        details: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { logAudit } = await import("./audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: (context.claims["email"] as string) ?? "",
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      details: data.details,
    });
    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { q?: string; action?: string } | undefined) =>
    z
      .object({ q: z.string().max(120).optional(), action: z.string().max(60).optional() })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let logs = await firestoreRest.list<Record<string, unknown>>("audit_logs");
    if (data.action && data.action !== "all") {
      logs = logs.filter((l) => String(l["action"] ?? "").startsWith(data.action!));
    }
    if (data.q) {
      const q = data.q.toLowerCase();
      logs = logs.filter(
        (l) =>
          String(l["actor_email"] ?? "")
            .toLowerCase()
            .includes(q) ||
          String(l["entity_id"] ?? "")
            .toLowerCase()
            .includes(q) ||
          String(l["action"] ?? "")
            .toLowerCase()
            .includes(q),
      );
    }
    logs.sort((a, b) => String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")));
    return logs.slice(0, 300);
  });

/** Retention window + archive list for the compliance panel. */
export const getAuditPolicy = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const settings = await firestoreRest.get<Record<string, unknown>>("site_settings", "default");
    const archives = await firestoreRest.list<Record<string, unknown>>("audit_archives");
    archives.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
    return {
      settings: settings ?? {
        id: "default",
        audit_retention_days: 365,
        audit_archive_enabled: true,
      },
      archives: archives.slice(0, 50),
    };
  });

export const saveAuditPolicy = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string(),
        audit_retention_days: z.number().int().min(30).max(3650),
        audit_archive_enabled: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    await firestoreRest.patch("site_settings", id || "default", {
      ...patch,
      updated_at: new Date().toISOString(),
    });
    const { logAudit } = await import("./audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: (context.claims["email"] as string) ?? "",
      action: "audit.retention_updated",
      entity: "site_settings",
      entityId: id,
      details: {
        retention_days: data.audit_retention_days,
        automatic_archiving: data.audit_archive_enabled,
      },
    });
    return { ok: true };
  });

/** Archive everything older than the retention window right now. */
export const runAuditArchive = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const email = (context.claims["email"] as string) ?? "";
    const { archiveOldAuditLogs } = await import("./audit-retention.server");
    const result = await archiveOldAuditLogs({ id: context.userId, email });
    const { logAudit } = await import("./audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: email,
      action: "audit.archive_run",
      entity: "audit_logs",
      entityId: result.archiveId ?? "",
      details: { archived: result.archived, retention_days: result.retentionDays },
    });
    return result;
  });

/** Full rows of one archive, for CSV/PDF compliance exports. */
export const getAuditArchive = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const row = await firestoreRest.get<Record<string, unknown>>("audit_archives", data.id);
    if (!row) throw new Error("That archive no longer exists.");
    return row;
  });
