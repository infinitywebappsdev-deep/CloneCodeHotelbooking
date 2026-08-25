import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestoreRest } from "./firebase-server";

export const listRooms = createServerFn({ method: "GET" }).handler(async () => {
  const rooms = await firestoreRest.list<Record<string, unknown>>("rooms");
  if (rooms.length === 0) {
    const { ROOMS } = await import("./hotel");
    return ROOMS.map((r, idx) => ({
      id: r.slug,
      slug: r.slug,
      name: r.name,
      rate: r.rate,
      units: r.qty,
      occupancy: r.occupancy,
      size: r.size,
      image_url: r.image,
      blurb: r.blurb,
      features: r.features,
      sort_order: idx,
      published: true,
    }));
  }
  const published = rooms.filter((r) => r["published"] !== false);
  return published.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
});

export const getRoom = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const rooms = await firestoreRest.list<Record<string, unknown>>("rooms");
    if (rooms.length === 0) {
      const { ROOMS } = await import("./hotel");
      const r = ROOMS.find((rm) => rm.slug === data.slug);
      if (!r) return null;
      return {
        id: r.slug,
        slug: r.slug,
        name: r.name,
        rate: r.rate,
        units: r.qty,
        occupancy: r.occupancy,
        size: r.size,
        image_url: r.image,
        blurb: r.blurb,
        features: r.features,
        published: true,
      };
    }
    const room = rooms.find((r) => r["slug"] === data.slug && r["published"] !== false);
    return room ?? null;
  });

export const listFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const faqs = await firestoreRest.list<Record<string, unknown>>("faqs");
  const published = faqs.filter((f) => f["published"] !== false);
  return published.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
});

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const images = await firestoreRest.list<Record<string, unknown>>("gallery_images");
  const published = images.filter((i) => i["published"] !== false);
  return published.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
});

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const pages = await firestoreRest.list<Record<string, unknown>>("pages");
    const page = pages.find((p) => p["slug"] === data.slug);
    return page ?? null;
  });

/** Custom pages created in the CMS that should appear in site navigation. */
export const listNavPages = createServerFn({ method: "GET" }).handler(async () => {
  const pages = await firestoreRest.list<Record<string, unknown>>("pages");
  const nav = pages.filter(
    (p) =>
      p["published"] !== false &&
      typeof p["nav_label"] === "string" &&
      p["nav_label"].trim() !== "",
  );
  return nav.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
});

const rangeSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((d: { checkIn: string; checkOut: string }) => rangeSchema.parse(d))
  .handler(async ({ data }) => {
    if (new Date(data.checkOut) <= new Date(data.checkIn)) return [];

    const [rooms, reservations] = await Promise.all([
      firestoreRest.list<Record<string, unknown>>("rooms"),
      firestoreRest.list<Record<string, unknown>>("reservations"),
    ]);

    const activeReservations = reservations.filter((r) => {
      const status = String(r["status"] || "");
      if (!["pending", "confirmed", "checked_in"].includes(status)) return false;
      const rCheckIn = String(r["check_in"]);
      const rCheckOut = String(r["check_out"]);
      return rCheckIn < data.checkOut && rCheckOut > data.checkIn;
    });

    return rooms
      .filter((room) => room["published"] !== false)
      .map((room) => {
        const booked = activeReservations.filter((r) => r["room_id"] === room["id"]).length;
        const units = Number(room["units"] || 1);
        const available = Math.max(0, units - booked);
        return {
          room_id: room["id"],
          room_name: room["name"],
          units,
          booked,
          available,
        };
      });
  });

const reservationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40),
  slug: z.string().min(1).max(80),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(10),
  requests: z.string().trim().max(1000).default(""),
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reservationSchema.parse(d))
  .handler(async ({ data }) => {
    const nights = Math.round(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / 86_400_000,
    );
    if (nights < 1) throw new Error("Departure must be after arrival.");

    const rooms = await firestoreRest.list<Record<string, unknown>>("rooms");
    const room = rooms.find((r) => r["slug"] === data.slug);
    if (!room) throw new Error("That room category is no longer available.");

    const reservations = await firestoreRest.list<Record<string, unknown>>("reservations");
    const overlapping = reservations.filter((r) => {
      if (r["room_id"] !== room["id"]) return false;
      const status = String(r["status"] || "");
      if (!["pending", "confirmed", "checked_in"].includes(status)) return false;
      const rCheckIn = String(r["check_in"]);
      const rCheckOut = String(r["check_out"]);
      return rCheckIn < data.checkOut && rCheckOut > data.checkIn;
    });

    const units = Number(room["units"] || 1);
    if (overlapping.length >= units) {
      throw new Error(
        `${room["name"]} is fully booked for those dates. Please pick another room or dates.`,
      );
    }

    const reference = `BHS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const rate = Number(room["rate"] || 0);
    const total = nights * rate;

    const inserted = await firestoreRest.create<Record<string, unknown>>("reservations", {
      reference,
      guest_name: data.name,
      guest_email: data.email.toLowerCase(),
      guest_phone: data.phone,
      room_id: room["id"],
      room_name: room["name"],
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests: data.guests,
      nights,
      rate,
      total,
      requests: data.requests,
      status: "pending",
      payment_status: "unpaid",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const { notifyReservationReceived } = await import("./notify.server");
    await notifyReservationReceived({
      reference: inserted["reference"] as string,
      name: data.name,
      email: data.email,
      roomName: room["name"] as string,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      total,
    }).catch((err) => console.warn("Email notice failure:", err));

    return {
      id: inserted.id,
      reference,
      total,
      nights,
      room_name: room["name"],
      rate,
    };
  });

export const listPublicPosts = createServerFn({ method: "GET" }).handler(async () => {
  const posts = await firestoreRest.list<Record<string, unknown>>("posts");
  if (posts.length === 0) {
    const { SEED_POSTS } = await import("./cms.functions");
    return SEED_POSTS;
  }
  const published = posts.filter((p) => p["status"] === "published" || p["published"] !== false);
  return published.sort((a, b) =>
    String(b["published_at"] || b["created_at"] || "").localeCompare(
      String(a["published_at"] || a["created_at"] || ""),
    ),
  );
});

export const getPublicPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const posts = await firestoreRest.list<Record<string, unknown>>("posts");
    if (posts.length === 0) {
      const { SEED_POSTS } = await import("./cms.functions");
      const p = SEED_POSTS.find((post) => post.slug === data.slug);
      return p ?? null;
    }
    const found = posts.find(
      (p) => p["slug"] === data.slug && (p["status"] === "published" || p["published"] !== false),
    );
    return found ?? null;
  });

export const getRoomMonthlyAvailability = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; year: number; month: number }) =>
    z
      .object({
        slug: z.string().min(1),
        year: z.number().int().min(2025).max(2035),
        month: z.number().int().min(1).max(12),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const [rooms, reservations] = await Promise.all([
      firestoreRest.list<Record<string, unknown>>("rooms"),
      firestoreRest.list<Record<string, unknown>>("reservations"),
    ]);

    const room =
      rooms.find((r) => r["slug"] === data.slug) ||
      (await import("./hotel")).ROOMS.find((r) => r.slug === data.slug);

    if (!room) {
      throw new Error("Room category not found");
    }

    const roomId = (room as Record<string, unknown>)["id"] || (room as { slug: string }).slug;
    const roomName = (room as Record<string, unknown>)["name"] as string;
    const totalUnits = Number(
      (room as Record<string, unknown>)["units"] ?? (room as { qty?: number }).qty ?? 1,
    );
    const rate = Number((room as Record<string, unknown>)["rate"] ?? 0);

    // Filter active reservations for this room
    const roomReservations = reservations.filter((r) => {
      const status = String(r["status"] || "");
      if (!["pending", "confirmed", "checked_in"].includes(status)) return false;
      const rRoomId = String(r["room_id"] || "");
      const rSlug = String(r["slug"] || "");
      return rRoomId === roomId || rRoomId === data.slug || rSlug === data.slug;
    });

    // Generate dates for the requested month
    const daysInMonth = new Date(data.year, data.month, 0).getDate();
    const daysMap: Record<
      string,
      {
        status: "available" | "limited" | "booked";
        unitsLeft: number;
        totalUnits: number;
        rate: number;
      }
    > = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(data.month).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateStr = `${data.year}-${monthStr}-${dayStr}`;

      // Check how many overlapping reservations cover this date
      const bookedUnits = roomReservations.filter((r) => {
        const checkIn = String(r["check_in"] || "");
        const checkOut = String(r["check_out"] || "");
        return checkIn <= dateStr && checkOut > dateStr;
      }).length;

      const unitsLeft = Math.max(0, totalUnits - bookedUnits);
      let status: "available" | "limited" | "booked" = "available";

      if (unitsLeft === 0) {
        status = "booked";
      } else if (unitsLeft < totalUnits) {
        status = "limited";
      }

      daysMap[dateStr] = {
        status,
        unitsLeft,
        totalUnits,
        rate,
      };
    }

    return {
      roomSlug: data.slug,
      roomName,
      totalUnits,
      rate,
      year: data.year,
      month: data.month,
      days: daysMap,
    };
  });

export const confirmPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        reference: z.string().min(1),
        paystackRef: z.string().min(1),
        amount: z.number().positive(),
        guestEmail: z.string().email().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const reservations = await firestoreRest.list<Record<string, unknown>>("reservations");
    const target = reservations.find(
      (r) => r["reference"] === data.reference || r["id"] === data.reference,
    );

    if (!target) {
      throw new Error(`Reservation with reference ${data.reference} not found.`);
    }

    const updated = await firestoreRest.patch<Record<string, unknown>>(
      "reservations",
      target.id as string,
      {
        payment_status: "paid",
        status: "confirmed",
        payment_method: "paystack",
        paystack_reference: data.paystackRef,
        paid_amount: data.amount,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    );

    // Send confirmation notice
    try {
      const { notifyReservationReceived } = await import("./notify.server");
      await notifyReservationReceived({
        reference: target["reference"] as string,
        name: (target["guest_name"] as string) || "Guest",
        email: (target["guest_email"] as string) || data.guestEmail || "",
        roomName: (target["room_name"] as string) || "Room Suite",
        checkIn: target["check_in"] as string,
        checkOut: target["check_out"] as string,
        nights: Number(target["nights"] || 1),
        total: Number(target["total"] || data.amount),
      });
    } catch (err) {
      console.warn("Paystack confirmation email error:", err);
    }

    return { ok: true, reservation: updated };
  });
