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
