import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOverview } from "@/lib/admin.functions";
import { broadcastStaffAlert, listStaffDispatches } from "@/lib/cms.functions";
import { formatDate, STATUS_LABEL, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Bell,
  Radio,
  Send,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BedDouble,
  DollarSign,
  MessageSquare,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

type StaffDispatchRecord = {
  id: string;
  priority: "urgent" | "high" | "normal" | "announcement";
  department: "all" | "front_desk" | "housekeeping" | "maintenance" | "kitchen";
  category: string;
  title: string;
  message: string;
  sender_email?: string;
  created_at?: string;
};

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </div>
      <p className="mt-2 font-display text-3xl text-foreground font-bold">{value}</p>
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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    refetchInterval: 30_000,
  });

  const { data: dispatches = [] } = useQuery({
    queryKey: ["staff-dispatches"],
    queryFn: () => listStaffDispatches() as Promise<StaffDispatchRecord[]>,
    refetchInterval: 20_000,
  });

  // Alert Broadcaster State
  const [priority, setPriority] = useState<"urgent" | "high" | "normal" | "announcement">("urgent");
  const [department, setDepartment] = useState<
    "all" | "front_desk" | "housekeeping" | "maintenance" | "kitchen"
  >("all");
  const [category, setCategory] = useState("Urgent Substation / Maintenance");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const broadcastMutation = useMutation({
    mutationFn: () =>
      broadcastStaffAlert({
        data: {
          priority,
          department,
          category,
          title: title.trim(),
          message: message.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Staff priority alert broadcasted successfully!", {
        description: `Dispatched to ${department.toUpperCase()} with ${priority.toUpperCase()} priority.`,
      });
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["staff-dispatches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleQuickTemplate = (preset: {
    p: "urgent" | "high" | "normal" | "announcement";
    dept: "all" | "front_desk" | "housekeeping" | "maintenance" | "kitchen";
    cat: string;
    tit: string;
    msg: string;
  }) => {
    setPriority(preset.p);
    setDepartment(preset.dept);
    setCategory(preset.cat);
    setTitle(preset.tit);
    setMessage(preset.msg);
    toast.info(`Loaded quick template: ${preset.tit}`);
  };

  if (isLoading || !data)
    return <p className="text-sm text-muted-foreground">Loading today's activity…</p>;

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="In house"
          value={String(data.inHouseCount)}
          hint={`${data.totalUnits} rooms total`}
          icon={BedDouble}
        />
        <Stat
          label="Occupancy"
          value={`${data.occupancy}%`}
          hint="Rooms occupied tonight"
          icon={TrendingUp}
        />
        <Stat
          label="Revenue this month"
          value={naira(data.revenueMonth)}
          hint="Excludes cancellations"
          icon={DollarSign}
        />
        <Stat
          label="Unread messages"
          value={String(data.unreadMessages)}
          hint="From guests in the portal"
          icon={MessageSquare}
        />
      </div>

      {/* STAFF DISPATCH & MANUAL PUSH NOTIFICATION CONSOLE */}
      <Card className="p-6 border-primary/30 bg-card/95 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 animate-pulse">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
                Staff Emergency & Push Alert Dispatcher
              </h2>
              <p className="text-xs text-muted-foreground">
                Broadcast instant high-priority instructions to on-duty staff, front desk,
                housekeeping & engineering.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() =>
                handleQuickTemplate({
                  p: "urgent",
                  dept: "maintenance",
                  cat: "Substation & HVAC",
                  tit: "Substation Generator Diesel Check",
                  msg: "Engineering team: Confirm backup diesel generator reserves and power synchronization for evening peak load.",
                })
              }
            >
              <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" /> Power Sync
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() =>
                handleQuickTemplate({
                  p: "high",
                  dept: "housekeeping",
                  cat: "VIP Arrival Preparation",
                  tit: "Signature Suite VIP Sanitation & Welcome Fruits",
                  msg: "Diplomatic guest arriving in 30 minutes. Conduct final luxury linen sanitization and place chilled hibiscus refreshments in Signature Suite.",
                })
              }
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> VIP Arrival
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() =>
                handleQuickTemplate({
                  p: "urgent",
                  dept: "all",
                  cat: "Security Briefing",
                  tit: "Perimeter Gate Access & CCTV Patrol",
                  msg: "Security personnel: Ensure strict verification of evening visitor vehicles and active CCTV surveillance on main gate.",
                })
              }
            >
              <ShieldAlert className="h-3.5 w-3.5 mr-1 text-red-500" /> Security Notice
            </Button>
          </div>
        </div>

        {/* Dispatch Form */}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "urgent" | "high" | "normal" | "announcement")
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                >
                  <option value="urgent">🚨 Urgent (Red Code)</option>
                  <option value="high">⚠️ High Priority</option>
                  <option value="normal">ℹ️ Normal Operation</option>
                  <option value="announcement">📢 Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Recipient Team
                </label>
                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value as
                        "all" | "front_desk" | "housekeeping" | "maintenance" | "kitchen",
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">👥 All On-Duty Staff</option>
                  <option value="front_desk">🛎️ Front Desk & Concierge</option>
                  <option value="housekeeping">🛏️ Housekeeping & Cleaners</option>
                  <option value="maintenance">⚡ Maintenance & Engineering</option>
                  <option value="kitchen">🍳 Kitchen & Restaurant 2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Operation Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. VIP Concierge, Power"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Dispatch Subject Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Expedite Room 204 Suite Turn-down & Room Service"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Detailed Instruction Message
              </label>
              <Textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write specific instructions, room numbers, or action steps for the team..."
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                Dispatches are logged with actor audit ID in Firestore.
              </span>
              <Button
                disabled={broadcastMutation.isPending || !title.trim() || !message.trim()}
                onClick={() => broadcastMutation.mutate()}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <Send className="h-4 w-4" />
                {broadcastMutation.isPending ? "Broadcasting..." : "Broadcast Alert to Staff"}
              </Button>
            </div>
          </div>

          {/* Recent Dispatches Log */}
          <div className="border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-5 space-y-3">
            <h4 className="font-semibold text-sm flex items-center justify-between">
              <span>Recent Dispatches</span>
              <Badge variant="outline" className="text-[10px]">
                {dispatches.length} Total
              </Badge>
            </h4>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {dispatches.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent alerts dispatched.</p>
              ) : (
                dispatches.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-lg border border-border/80 bg-muted/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={d.priority === "urgent" ? "destructive" : "secondary"}
                        className="text-[9px] uppercase"
                      >
                        {d.priority}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                    <div className="font-semibold text-foreground truncate">{d.title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-[11px]">{d.message}</p>
                    <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between border-t border-border/40 pt-1">
                      <span>To: {d.department}</span>
                      <span>By: {d.sender_email ? d.sender_email.split("@")[0] : "Staff"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Stay Lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <List title="Arriving today" rows={data.arrivals as ReservationRecord[]} />
        <List title="Departing today" rows={data.departures as ReservationRecord[]} />
        <List title="Awaiting confirmation" rows={data.pending as ReservationRecord[]} />
      </div>

      {/* Latest Bookings Card */}
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
