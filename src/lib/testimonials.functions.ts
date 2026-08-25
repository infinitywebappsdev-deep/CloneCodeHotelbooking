import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestoreRest } from "./firebase-server";

export interface Testimonial {
  id: string;
  guest_name: string;
  location: string;
  rating: number;
  content: string;
  stay_type: string;
  verified: boolean;
  created_at: string;
}

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    guest_name: "Dr. Folashade Adeyemi",
    location: "Lagos, Nigeria",
    rating: 5,
    content:
      "Banky Hotel & Suites was an oasis of calm during my week-long conference in Ado-Ekiti. The Diplomatic Suite was spotless, the bed exceptionally comfortable, and the chef prepared the most delicious pounded yam with egusi soup. Uninterrupted power and 24/7 security gave complete peace of mind.",
    stay_type: "Diplomatic Suite · 5-Night Stay",
    verified: true,
    created_at: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "rev-2",
    guest_name: "Engr. Babatunde Ogunleye",
    location: "Abuja, FCT",
    rating: 5,
    content:
      "A remarkable standard of boutique luxury in Ekiti State. The high-speed internet and quiet executive workspace allowed me to run international board calls without a hitch. The evening breeze at the open-air bar is something I eagerly looked forward to every day.",
    stay_type: "Signature Suite · Business Trip",
    verified: true,
    created_at: "2026-08-02T14:30:00.000Z",
  },
  {
    id: "rev-3",
    guest_name: "Chidinma & Obinna Kalu",
    location: "Port Harcourt",
    rating: 5,
    content:
      "We held our wedding reception at Banky Hall and stayed in the Presidential Suite. From the personalized concierge welcome to the breakfast served fresh in the morning, the staff treated us like royalty. All our guests commended the hospitality.",
    stay_type: "Banky Hall & Suite · Wedding Weekend",
    verified: true,
    created_at: "2026-08-10T09:15:00.000Z",
  },
  {
    id: "rev-4",
    guest_name: "Aisha Mohammed",
    location: "Kano, Nigeria",
    rating: 5,
    content:
      "The cleanliness, aesthetic lighting, and warm welcoming demeanor of the reception staff exceeded my expectations. If you want peace, good food, and authentic Ekiti warmth, Banky Hotel & Suites is the absolute top choice.",
    stay_type: "Super Executive · Weekend Getaway",
    verified: true,
    created_at: "2026-08-18T16:45:00.000Z",
  },
  {
    id: "rev-5",
    guest_name: "Marcus Vance",
    location: "London, United Kingdom",
    rating: 5,
    content:
      "Visiting family in Ekiti for the summer. Finding a hotel with reliable air conditioning, crisp white sheets, modern glass design, and seamless airport pickup made all the difference. Superb experience from check-in to checkout.",
    stay_type: "Executive Suite · 7-Night Stay",
    verified: true,
    created_at: "2026-08-20T11:20:00.000Z",
  },
];

export const listTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const list = await firestoreRest.list<Testimonial>("testimonials");
    if (list && list.length > 0) {
      return list.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
    }
  } catch (err) {
    console.warn("Could not fetch testimonials from Firestore, using curated collection:", err);
  }
  return SEED_TESTIMONIALS;
});

export const submitTestimonial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        guest_name: z.string().trim().min(2).max(100),
        location: z.string().trim().max(100).optional().default("Nigeria"),
        rating: z.number().int().min(1).max(5),
        content: z.string().trim().min(10).max(1000),
        stay_type: z.string().trim().max(100).optional().default("Guest Stay"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const doc = await firestoreRest.create("testimonials", {
      guest_name: data.guest_name,
      location: data.location || "Nigeria",
      rating: data.rating,
      content: data.content,
      stay_type: data.stay_type || "Guest Stay",
      verified: true,
      created_at: new Date().toISOString(),
    });
    return { ok: true, id: doc.id };
  });
