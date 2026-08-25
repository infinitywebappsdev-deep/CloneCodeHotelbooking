export type RoomRecord = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  rate: number;
  units: number;
  occupancy: string;
  size: string;
  image_url: string | null;
  features: string[];
  published: boolean;
  sort_order: number;
};

export type AvailabilityRow = {
  room_id: string;
  slug: string;
  name: string;
  units: number;
  booked: number;
  available: number;
  rate: number;
};

export type ReservationRecord = {
  id: string;
  reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_name: string;
  room_id: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  rate: number;
  total: number;
  status: string;
  payment_status: string;
  requests: string;
  staff_notes: string;
  created_at: string;
};

export const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "In house",
  checked_out: "Checked out",
  cancelled: "Cancelled",
};

export function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
  return diff > 0 ? Math.round(diff) : 0;
}

export function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join(
    "\n",
  );
}
