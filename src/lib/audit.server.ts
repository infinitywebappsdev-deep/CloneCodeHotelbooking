import { firestoreRest } from "./firebase-server";

/** Server-only helper that appends an entry to the admin audit log. */
export async function logAudit(entry: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await firestoreRest.create("audit_logs", {
      actor_id: entry.actorId ?? null,
      actor_email: entry.actorEmail ?? "",
      action: entry.action,
      entity: entry.entity ?? "",
      entity_id: entry.entityId ?? "",
      details: entry.details ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Auditing must never break the action the staff member just took.
  }
}
