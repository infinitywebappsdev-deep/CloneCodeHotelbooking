import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminOverview } from "@/lib/admin.functions";
import { formatDate, STATUS_LABEL, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function List({ title, rows }: { title: string; rows: ReservationRecord[] }) {
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing here today.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{r.guest_name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.room_name} · {formatDate(r.check_in)} → {formatDate(r.check_out)}
                </p>
              </div>
              <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
  });

  if (isLoading || !data)
    return <p className="text-sm text-muted-foreground">Loading today's activity…</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="In house"
          value={String(data.inHouseCount)}
          hint={`${data.totalUnits} rooms total`}
        />
        <Stat label="Occupancy" value={`${data.occupancy}%`} hint="Rooms occupied tonight" />
        <Stat
          label="Revenue this month"
          value={naira(data.revenueMonth)}
          hint="Excludes cancellations"
        />
        <Stat
          label="Unread messages"
          value={String(data.unreadMessages)}
          hint="From guests in the portal"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <List title="Arriving today" rows={data.arrivals as ReservationRecord[]} />
        <List title="Departing today" rows={data.departures as ReservationRecord[]} />
        <List title="Awaiting confirmation" rows={data.pending as ReservationRecord[]} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Latest bookings</h2>
          <Link to="/admin/reservations" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border/60 text-sm">
          {(data.recent as ReservationRecord[]).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">
                  {r.reference} · {r.guest_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.room_name} · {formatDate(r.check_in)} → {formatDate(r.check_out)} ·{" "}
                  {naira(r.total)}
                </p>
              </div>
              <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
