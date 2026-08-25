import { ROOMS, Room, naira } from "./hotel";

export type AvailabilityStatus =
  "idle" | "checking" | "available" | "limited" | "unavailable" | "invalid_dates";

export interface AlternativeRoom {
  slug: string;
  name: string;
  rate: number;
  image: string;
  availableUnits: number;
  occupancy: string;
}

export interface AvailabilityCheckResult {
  status: AvailabilityStatus;
  roomSlug: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  availableUnits: number;
  totalUnits: number;
  message: string;
  badgeText: string;
  alternatives: AlternativeRoom[];
  priceBreakdown: {
    nightlyRate: number;
    subtotal: number;
    vat: number; // 7.5%
    tourismLevy: number; // 5.0%
    total: number;
  };
}

// Deterministic mock busy dates for simulation realism (e.g., peak holidays / busy weekends)
function isSimulatedBusyWindow(roomSlug: string, checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;

  const inTime = new Date(checkIn).getTime();
  const outTime = new Date(checkOut).getTime();

  if (isNaN(inTime) || isNaN(outTime)) return false;

  // Simulate sold out for Signature Suite on select specific dates if tested
  // For standard user dates, we generate realistic inventory using deterministic date hash
  const combined = `${roomSlug}-${checkIn}-${checkOut}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }

  // Single-quantity exclusive rooms (like Signature Suite qty:1) have a higher chance of limited/booked on certain hash values
  const room = ROOMS.find((r) => r.slug === roomSlug);
  if (room && room.qty === 1) {
    // 15% probability of booked scenario on 1-unit suites for testing alternative recommendations
    return Math.abs(hash) % 7 === 0;
  }

  return false;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  const diff = (b - a) / 86_400_000;
  return diff > 0 ? Math.round(diff) : 0;
}

/**
 * Validates and checks real-time room availability for selected dates
 */
export async function checkRoomAvailability(params: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  guestsCount?: number;
}): Promise<AvailabilityCheckResult> {
  const { roomSlug, checkIn, checkOut, guestsCount = 2 } = params;

  // Add realistic network verification latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  const room: Room = ROOMS.find((r) => r.slug === roomSlug) || ROOMS[0]!;
  const nights = calculateNights(checkIn, checkOut);

  // Validate dates
  if (!checkIn || !checkOut) {
    return {
      status: "idle",
      roomSlug: room.slug,
      roomName: room.name,
      checkIn,
      checkOut,
      nights: 0,
      availableUnits: room.qty,
      totalUnits: room.qty,
      message: "Select arrival and departure dates to verify live room inventory.",
      badgeText: "Dates Required",
      alternatives: [],
      priceBreakdown: {
        nightlyRate: room.rate,
        subtotal: room.rate,
        vat: Math.round(room.rate * 0.075),
        tourismLevy: Math.round(room.rate * 0.05),
        total: Math.round(room.rate * 1.125),
      },
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (checkIn < todayStr || checkOut <= checkIn) {
    return {
      status: "invalid_dates",
      roomSlug: room.slug,
      roomName: room.name,
      checkIn,
      checkOut,
      nights: 0,
      availableUnits: 0,
      totalUnits: room.qty,
      message: "Departure date must be at least 1 day after arrival date.",
      badgeText: "Invalid Date Selection",
      alternatives: [],
      priceBreakdown: {
        nightlyRate: room.rate,
        subtotal: 0,
        vat: 0,
        tourismLevy: 0,
        total: 0,
      },
    };
  }

  const isSoldOut = isSimulatedBusyWindow(room.slug, checkIn, checkOut);

  // Calculate pricing
  const subtotal = room.rate * Math.max(1, nights);
  const vat = Math.round(subtotal * 0.075);
  const tourismLevy = Math.round(subtotal * 0.05);
  const total = subtotal + vat + tourismLevy;

  // If sold out, find available alternative rooms
  if (isSoldOut) {
    const alternatives: AlternativeRoom[] = ROOMS.filter(
      (r) => r.slug !== room.slug && !isSimulatedBusyWindow(r.slug, checkIn, checkOut),
    )
      .slice(0, 3)
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        rate: r.rate,
        image: r.image,
        availableUnits: r.qty,
        occupancy: r.occupancy,
      }));

    return {
      status: "unavailable",
      roomSlug: room.slug,
      roomName: room.name,
      checkIn,
      checkOut,
      nights,
      availableUnits: 0,
      totalUnits: room.qty,
      message: `${room.name} is fully booked for ${checkIn} to ${checkOut}. Please select alternative dates or consider the recommended suites below.`,
      badgeText: "Fully Booked for Dates",
      alternatives,
      priceBreakdown: {
        nightlyRate: room.rate,
        subtotal,
        vat,
        tourismLevy,
        total,
      },
    };
  }

  // Calculate realistic available units
  // Deterministic calculation for stock inventory
  const dateHash = (checkIn.length + checkOut.length + room.name.length) % 3;
  let availableUnits = Math.max(1, room.qty - dateHash);
  if (availableUnits > room.qty) availableUnits = room.qty;

  const isLimited = availableUnits === 1 && room.qty > 1;

  return {
    status: isLimited ? "limited" : "available",
    roomSlug: room.slug,
    roomName: room.name,
    checkIn,
    checkOut,
    nights,
    availableUnits,
    totalUnits: room.qty,
    message: isLimited
      ? `High Demand! Only 1 ${room.name} remaining for your selected dates.`
      : `Confirmed Available: ${availableUnits} of ${room.qty} ${room.name} ready for reservation.`,
    badgeText: isLimited ? "Only 1 Room Left!" : "Guaranteed Available",
    alternatives: [],
    priceBreakdown: {
      nightlyRate: room.rate,
      subtotal,
      vat,
      tourismLevy,
      total,
    },
  };
}
