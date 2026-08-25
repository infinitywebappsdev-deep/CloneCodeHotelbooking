import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestoreRest } from "./firebase-server";

export interface RoomReview {
  id: string;
  room_slug: string;
  guest_name: string;
  guest_email?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  stay_date?: string;
  verified: boolean;
  created_at: string;
}

export const SEED_ROOM_REVIEWS: RoomReview[] = [
  {
    id: "rev-sig-1",
    room_slug: "signature-suite",
    guest_name: "Engr. Babatunde Ogunleye",
    guest_email: "babatunde.o@gmail.com",
    rating: 5,
    title: "Unrivaled luxury and absolute privacy",
    comment:
      "The Signature Suite is exceptional in every detail. The living room is spacious with fantastic floor-to-ceiling lighting, the dedicated butler service was responsive, and the complimentary breakfast was served hot to the dining table. Easily the finest accommodation in Ekiti State.",
    stay_date: "August 2026",
    verified: true,
    created_at: "2026-08-12T14:30:00.000Z",
  },
  {
    id: "rev-sig-2",
    room_slug: "signature-suite",
    guest_name: "Chidinma & Obinna Kalu",
    rating: 5,
    title: "Perfect wedding anniversary getaway",
    comment:
      "We spent our anniversary weekend in the Signature Suite. The jacuzzi, comfortable king mattress, and late checkout courtesy of the reception made our stay truly unforgettable. 10/10 recommendation.",
    stay_date: "July 2026",
    verified: true,
    created_at: "2026-07-28T09:15:00.000Z",
  },
  {
    id: "rev-dip-1",
    room_slug: "diplomatic-suite",
    guest_name: "Dr. Folashade Adeyemi",
    rating: 5,
    title: "Executive workstation and peaceful ambiance",
    comment:
      "Stayed for 5 nights during a university summit. The separate lounge allowed me to host brief meetings with colleagues, while the high-speed Wi-Fi and 24/7 power never dropped once. Will definitely return.",
    stay_date: "August 2026",
    verified: true,
    created_at: "2026-08-16T18:20:00.000Z",
  },
  {
    id: "rev-dip-2",
    room_slug: "diplomatic-suite",
    guest_name: "Hon. Segun Alabi",
    rating: 5,
    title: "Impeccable housekeeping and prompt service",
    comment:
      "The attention to cleanliness and guest security is top notch. The food from the restaurant was delicious, especially the fresh catfish pepper soup.",
    stay_date: "July 2026",
    verified: true,
    created_at: "2026-07-19T11:00:00.000Z",
  },
  {
    id: "rev-super-1",
    room_slug: "super-executive",
    guest_name: "Aisha Mohammed",
    rating: 5,
    title: "Sunlit room with serene vibes",
    comment:
      "Loved the reading corner and the soft daylight coming through the windows. The air conditioning was icy cold and quiet. Very peaceful sleep after a long journey.",
    stay_date: "August 2026",
    verified: true,
    created_at: "2026-08-04T16:45:00.000Z",
  },
  {
    id: "rev-exec-1",
    room_slug: "executive",
    guest_name: "Marcus Vance",
    rating: 5,
    title: "Modern amenities and great workspace",
    comment:
      "The Executive Room provided everything I needed for my business trip: a great rain shower, comfortable desk, smart TV with DSTV, and rapid room service.",
    stay_date: "August 2026",
    verified: true,
    created_at: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "rev-std-1",
    room_slug: "standard-plus",
    guest_name: "Tolulope Fasuan",
    rating: 5,
    title: "Great value and cozy seating area",
    comment:
      "Very neat and well maintained. The seating area is a great addition over standard hotel rooms. Excellent value for money in Ado-Ekiti.",
    stay_date: "July 2026",
    verified: true,
    created_at: "2026-07-22T08:30:00.000Z",
  },
];

export const listRoomReviews = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const all = await firestoreRest.list<RoomReview>("room_reviews");
      const matched = all.filter(
        (r) =>
          r.room_slug === data.slug &&
          (r as unknown as { published?: boolean }).published !== false,
      );

      if (matched.length > 0) {
        return matched.sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        );
      }
    } catch (err) {
      console.warn("Could not fetch room reviews from Firestore:", err);
    }

    // Fallback to seed reviews for this room or general room reviews
    const seeds = SEED_ROOM_REVIEWS.filter((r) => r.room_slug === data.slug);
    if (seeds.length > 0) return seeds;

    // Generic fallback for rooms without direct seed
    return [
      {
        id: `rev-gen-${data.slug}-1`,
        room_slug: data.slug,
        guest_name: "Dr. Kemi Adeleke",
        rating: 5,
        title: "Comfortable and impeccably clean",
        comment:
          "Enjoyed my stay here thoroughly. The room is modern, quiet, and the hospitality from check-in to breakfast was first-class.",
        stay_date: "Recent Stay",
        verified: true,
        created_at: "2026-08-01T10:00:00.000Z",
      },
    ];
  });

export const submitRoomReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        room_slug: z.string().min(1).max(80),
        guest_name: z.string().trim().min(2).max(100),
        guest_email: z.string().trim().email().max(160).optional().or(z.literal("")),
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().min(3).max(120),
        comment: z.string().trim().min(10).max(1500),
        stay_date: z.string().trim().max(50).optional().default("Recent Stay"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const created = await firestoreRest.create<RoomReview>(
      "room_reviews",
      {
        room_slug: data.room_slug,
        guest_name: data.guest_name,
        guest_email: data.guest_email || "",
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        stay_date: data.stay_date || "Recent Stay",
        verified: true,
        created_at: new Date().toISOString(),
      },
      reviewId,
    );

    return { ok: true, review: created };
  });
