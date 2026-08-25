/** Server-only audit log retention: archives entries older than the configured window. */
import { firestoreRest } from "./firebase-server";

type ArchiveResult = {
  archived: number;
  retentionDays: number;
  enabled: boolean;
  archiveId?: string;
};

export async function archiveOldAuditLogs(actor?: {
  id?: string;
  email?: string;
}): Promise<ArchiveResult> {
  const settings = await firestoreRest.get<Record<string, unknown>>("site_settings", "default");

  const retentionDays = Number(settings?.audit_retention_days ?? 365);
  const enabled = settings?.audit_archive_enabled ?? true;
  if (!enabled || retentionDays <= 0)
    return { archived: 0, retentionDays, enabled: Boolean(enabled) };

  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();
  const allLogs = await firestoreRest.list<{ id: string; created_at: string }>("audit_logs");
  const rows = allLogs.filter((r) => r.created_at && r.created_at < cutoff);

  if (!rows || rows.length === 0) return { archived: 0, retentionDays, enabled: true };

  rows.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  const first = rows[0];
  const last = rows[rows.length - 1];

  const archive = await firestoreRest.create("audit_archives", {
    period_start: first.created_at,
    period_end: last.created_at,
    row_count: rows.length,
    rows: rows,
    created_by: actor?.id ?? null,
    actor_email: actor?.email ?? "system",
    created_at: new Date().toISOString(),
  });

  for (const r of rows) {
    await firestoreRest.delete("audit_logs", r.id);
  }

  return { archived: rows.length, retentionDays, enabled: true, archiveId: archive.id };
}
