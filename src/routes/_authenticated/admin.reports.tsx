import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  reportRows,
  notificationJobs,
  requeueNotificationJob,
  discardNotificationJob,
  runReminderQueue,
} from "@/lib/admin.functions";
import { formatDate, toCsv, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ReminderJob = {
  id: string;
  kind: string;
  reference: string;
  recipient: string;
  status: string;
  attempts: number;
  max_attempts: number;
  last_error: string;
  next_attempt_at: string;
};

import { recordAuditEvent } from "@/lib/audit.functions";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsPage,
});

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["report", from, to],
    queryFn: () => reportRows({ data: { from, to } }) as Promise<ReservationRecord[]>,
  });

  const paid = rows.filter((r) => r.status !== "cancelled");
  const revenue = paid.reduce((sum, r) => sum + r.total, 0);
  const roomNights = paid.reduce((sum, r) => sum + r.nights, 0);
  const adr = roomNights ? Math.round(revenue / roomNights) : 0;

  const byRoom = Object.values(
    paid.reduce<
      Record<string, { room: string; bookings: number; nights: number; revenue: number }>
    >((acc, r) => {
      const key = r.room_name || "Unassigned";
      acc[key] ??= { room: key, bookings: 0, nights: 0, revenue: 0 };
      acc[key]!.bookings += 1;
      acc[key]!.nights += r.nights;
      acc[key]!.revenue += r.total;
      return acc;
    }, {}),
  ).sort((a, b) => b.revenue - a.revenue);

  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ["reminder-jobs"],
    queryFn: () => notificationJobs() as Promise<ReminderJob[]>,
    refetchInterval: 60_000,
  });
  const refreshJobs = () => queryClient.invalidateQueries({ queryKey: ["reminder-jobs"] });

  const requeue = useMutation({
    mutationFn: (id: string) => requeueNotificationJob({ data: { id } }),
    onSuccess: (res) => {
      refreshJobs();
      toast[res.outcome === "sent" ? "success" : "info"](
        res.outcome === "sent"
          ? "Reminder sent."
          : res.outcome === "dead"
            ? "Still failing — left in the dead-letter list."
            : "Requeued — it will retry automatically.",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const discard = useMutation({
    mutationFn: (id: string) => discardNotificationJob({ data: { id } }),
    onSuccess: () => {
      refreshJobs();
      toast.success("Reminder discarded.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runAll = useMutation({
    mutationFn: () => runReminderQueue(),
    onSuccess: (t) => {
      refreshJobs();
      toast.success(`Queue run: ${t.sent} sent, ${t.retry} retrying, ${t.dead} dead-lettered.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dead = jobs.filter((j) => j.status === "dead");
  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const kindLabel = (k: string) => (k === "thank_you" ? "Thank-you note" : "Arrival reminder");

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            rows.length
              ? (download(`banky-report-${from}-to-${to}.csv`, toCsv(rows as never)),
                void recordAuditEvent({
                  data: {
                    action: "export.report_bookings_csv",
                    entity: "reservations",
                    entityId: "",
                    details: { from, to, rows: rows.length },
                  },
                }).catch(() => {}))
              : toast.info("No bookings in this period.")
          }
        >
          Export bookings CSV
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            byRoom.length
              ? (download(`banky-room-summary-${from}-to-${to}.csv`, toCsv(byRoom as never)),
                void recordAuditEvent({
                  data: {
                    action: "export.report_rooms_csv",
                    entity: "rooms",
                    entityId: "",
                    details: { from, to },
                  },
                }).catch(() => {}))
              : toast.info("No bookings in this period.")
          }
        >
          Export room summary
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Bookings", String(paid.length)],
          ["Room nights", String(roomNights)],
          ["Revenue", naira(revenue)],
          ["Average nightly rate", naira(adr)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-serif text-2xl">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Room category</th>
              <th className="p-3">Bookings</th>
              <th className="p-3">Room nights</th>
              <th className="p-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {byRoom.map((r) => (
              <tr key={r.room} className="border-t border-border/60">
                <td className="p-3">{r.room}</td>
                <td className="p-3">{r.bookings}</td>
                <td className="p-3">{r.nights}</td>
                <td className="p-3">{naira(r.revenue)}</td>
              </tr>
            ))}
            {byRoom.length === 0 && (
              <tr>
                <td className="p-6 text-sm text-muted-foreground" colSpan={4}>
                  {isLoading ? "Loading report…" : "No bookings arriving in this period."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <div>
            <h2 className="font-serif text-lg">Reminder queue</h2>
            <p className="text-xs text-muted-foreground">
              {pendingJobs.length} waiting · {dead.length} failed after all retries
            </p>
          </div>
          <Button variant="outline" disabled={runAll.isPending} onClick={() => runAll.mutate()}>
            {runAll.isPending ? "Running…" : "Run due reminders"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Reminder</th>
                <th className="p-3">Booking</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Last error / next try</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...dead, ...pendingJobs].map((j) => (
                <tr key={j.id} className="border-t border-border/60 align-top">
                  <td className="p-3">
                    <span className="block">{kindLabel(j.kind)}</span>
                    <Badge
                      variant={j.status === "dead" ? "destructive" : "secondary"}
                      className="mt-1"
                    >
                      {j.status === "dead" ? "Dead letter" : "Queued"}
                    </Badge>
                  </td>
                  <td className="p-3">{j.reference || "—"}</td>
                  <td className="p-3 text-xs">{j.recipient}</td>
                  <td className="p-3 text-xs">
                    {j.attempts}/{j.max_attempts}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {j.last_error || "No errors yet."}
                    <span className="mt-1 block">
                      Next try {new Date(j.next_attempt_at).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={requeue.isPending}
                        onClick={() => requeue.mutate(j.id)}
                      >
                        Requeue
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={discard.isPending}
                        onClick={() => discard.mutate(j.id)}
                      >
                        Discard
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td className="p-6 text-sm text-muted-foreground" colSpan={6}>
                    All reminders have been delivered — nothing waiting or failed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Guest</th>
              <th className="p-3">Room</th>
              <th className="p-3">Stay</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3">{r.reference}</td>
                <td className="p-3">{r.guest_name}</td>
                <td className="p-3">{r.room_name}</td>
                <td className="p-3 text-xs">
                  {formatDate(r.check_in)} → {formatDate(r.check_out)}
                </td>
                <td className="p-3 text-xs capitalize">{r.status.replace("_", " ")}</td>
                <td className="p-3">{naira(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
