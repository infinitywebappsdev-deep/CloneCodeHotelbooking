import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAuditLogs } from "@/lib/audit.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

type Entry = {
  id: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
};

const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "auth", label: "Sign-ins & passwords" },
  { value: "cms", label: "Content edits" },
  { value: "export", label: "Exports" },
  { value: "reminders", label: "Reminder queue" },
];

const LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.password_changed": "Password changed",
  "auth.password_reset_requested": "Password reset requested",
  "cms.page_created": "Page created",
  "cms.page_updated": "Page updated",
  "cms.page_deleted": "Page deleted",
  "cms.faq_created": "FAQ added",
  "cms.faq_updated": "FAQ updated",
  "cms.faq_deleted": "FAQ deleted",
  "cms.gallery_created": "Gallery image added",
  "cms.gallery_updated": "Gallery image updated",
  "cms.gallery_deleted": "Gallery image removed",
  "cms.branding_updated": "Branding published",
  "cms.media_uploaded": "Image uploaded",
  "export.reservations_csv": "Reservations exported",
  "export.report_bookings_csv": "Bookings report exported",
  "export.report_rooms_csv": "Room summary exported",
  "reminders.requeued": "Reminder requeued",
  "reminders.discarded": "Reminder discarded",
  "reminders.queue_run": "Reminder queue run",
};

function AuditPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit", q, action],
    queryFn: () => listAuditLogs({ data: { q, action } }),
  });
  const rows = (data ?? []) as Entry[];

  function exportCsv() {
    const head = ["When", "Actor", "Action", "Record", "Details"];
    const body = rows.map((r) => [
      new Date(r.created_at).toISOString(),
      r.actor_email,
      r.action,
      `${r.entity} ${r.entity_id}`.trim(),
      JSON.stringify(r.details ?? {}),
    ]);
    const csv = [head, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `banky-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1">
          <Input
            placeholder="Search by staff email, action or record"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setAction(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                action === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
        <Button size="sm" onClick={exportCsv} disabled={!rows.length}>
          Export CSV
        </Button>
      </Card>

      <Card className="overflow-x-auto p-0">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading activity…</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No activity recorded yet for this filter.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">What happened</th>
                <th className="px-4 py-3">Record</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/60 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{row.actor_email || "System"}</td>
                  <td className="px-4 py-3">
                    <span>{LABELS[row.action] ?? row.action}</span>
                    {row.details && Object.keys(row.details).length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Object.entries(row.details)
                          .map(([k, v]) => `${k.replace(/_/g, " ")}: ${String(v)}`)
                          .join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.entity}
                    {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
