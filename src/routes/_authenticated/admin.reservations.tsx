import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminReservations,
  adminThread,
  staffReply,
  updateReservation,
} from "@/lib/admin.functions";
import { STATUSES, STATUS_LABEL, formatDate, toCsv, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSettings } from "@/components/site/SettingsContext";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: ReservationsPage,
});

import { recordAuditEvent } from "@/lib/audit.functions";

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

function download(name: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ReservationsPage() {
  const queryClient = useQueryClient();
  const settings = useSettings();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState<ReservationRecord | null>(null);

  const filters = { status, q, ...(from ? { from } : {}), ...(to ? { to } : {}) };
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-reservations", filters],
    queryFn: () => adminReservations({ data: filters }) as Promise<ReservationRecord[]>,
  });

  const save = useMutation({
    mutationFn: (input: Record<string, unknown>) => updateReservation({ data: input as never }),
    onSuccess: (updated) => {
      toast.success("Reservation updated.");
      setActive(updated as ReservationRecord);
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Name, email or reference"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="from">Arrival from</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">Arrival to</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            rows.length
              ? (download(
                  `banky-reservations-${new Date().toISOString().slice(0, 10)}.csv`,
                  toCsv(rows as never),
                ),
                void recordAuditEvent({
                  data: {
                    action: "export.reservations_csv",
                    entity: "reservations",
                    entityId: "",
                    details: { rows: rows.length },
                  },
                }).catch(() => {}))
              : toast.info("Nothing to export yet.")
          }
        >
          Export CSV
        </Button>
      </Card>

      <Card className="overflow-x-auto p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading reservations…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No reservations match these filters.</p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Room</th>
                <th className="p-3">Stay</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.reference}</td>
                  <td className="p-3">
                    {r.guest_name}
                    <br />
                    <span className="text-xs text-muted-foreground">{r.guest_email}</span>
                  </td>
                  <td className="p-3">{r.room_name}</td>
                  <td className="p-3 text-xs">
                    {formatDate(r.check_in)} → {formatDate(r.check_out)} ({r.nights}n)
                  </td>
                  <td className="p-3">{naira(r.total)}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </td>
                  <td className="p-3 text-xs capitalize">{r.payment_status.replace("_", " ")}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setActive(r)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {active.reference} — {active.guest_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  {active.room_name} · {active.guests} guest(s) · {naira(active.rate)}/night ·{" "}
                  {naira(active.total)} total
                </p>
                {active.requests && (
                  <p className="rounded-md bg-muted/50 p-3 text-xs">
                    Guest requests: {active.requests}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Arrival</Label>
                    <Input
                      type="date"
                      defaultValue={active.check_in}
                      onBlur={(e) =>
                        e.target.value !== active.check_in &&
                        save.mutate({
                          id: active.id,
                          check_in: e.target.value,
                          check_out: active.check_out,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Departure</Label>
                    <Input
                      type="date"
                      defaultValue={active.check_out}
                      onBlur={(e) =>
                        e.target.value !== active.check_out &&
                        save.mutate({
                          id: active.id,
                          check_in: active.check_in,
                          check_out: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={active.status}
                      onChange={(e) => save.mutate({ id: active.id, status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Payment</Label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={active.payment_status}
                      onChange={(e) =>
                        save.mutate({ id: active.id, payment_status: e.target.value })
                      }
                    >
                      {["unpaid", "part_paid", "paid", "refunded"].map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Internal notes</Label>
                  <Textarea
                    defaultValue={active.staff_notes}
                    rows={3}
                    onBlur={(e) =>
                      e.target.value !== active.staff_notes &&
                      save.mutate({ id: active.id, staff_notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://wa.me/${(active.guest_phone || "").replace(/\D/g, "") || settings.whatsapp}?text=${encodeURIComponent(
                        `Hello ${active.guest_name}, this is ${settings.hotel_name} regarding booking ${active.reference} (${formatDate(active.check_in)} → ${formatDate(active.check_out)}).`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Message on WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`mailto:${active.guest_email}?subject=${encodeURIComponent(`Booking ${active.reference}`)}`}
                    >
                      Email guest
                    </a>
                  </Button>
                </div>

                <Thread reservationId={active.id} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Thread({ reservationId }: { reservationId: string }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-thread", reservationId],
    queryFn: () => adminThread({ data: { reservationId } }),
  });

  const send = useMutation({
    mutationFn: () => staffReply({ data: { reservationId, body } }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-thread", reservationId] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <h3 className="text-sm font-medium">Guest conversation</h3>
      <div className="mt-2 max-h-52 space-y-2 overflow-y-auto">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet.</p>}
        {(messages as { id: string; sender: string; body: string; created_at: string }[]).map(
          (m) => (
            <div
              key={m.id}
              className={`rounded-md p-2 text-xs ${m.sender === "staff" ? "bg-primary/10" : "bg-muted"}`}
            >
              <p className="font-medium capitalize">{m.sender}</p>
              <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
            </div>
          ),
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reply to the guest…"
        />
        <Button size="sm" disabled={!body.trim() || send.isPending} onClick={() => send.mutate()}>
          Send
        </Button>
      </div>
    </div>
  );
}
