import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { firestoreRest } from "./firebase-server";

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export const submitReservationInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        guestName: z.string().trim().min(1).max(120),
        guestEmail: z.string().trim().email().max(120),
        guestPhone: z.string().trim().min(5).max(40),
        roomSlug: z.string().min(1).max(80),
        roomName: z.string().min(1).max(120),
        checkIn: z.string().min(8).max(30),
        checkOut: z.string().min(8).max(30),
        guestsCount: z.number().int().positive().max(20),
        specialRequests: z.string().max(1000).optional().default(""),
        estimatedTotal: z.number().nonnegative(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const reference = `BKY-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // 1. Generate automated personalized confirmation response with Gemini 3.7 Flash
    let aiConfirmation = "";
    try {
      const ai = getGenAI();
      const prompt = `You are the Executive Front Desk Concierge at Banky Hotel & Suites in Ado-Ekiti, Ekiti State, Nigeria.
A guest has just submitted a direct reservation booking inquiry through the official website.

Booking Details:
- Guest Name: ${data.guestName}
- Guest Email: ${data.guestEmail}
- Guest Phone / WhatsApp: ${data.guestPhone}
- Selected Accommodation: ${data.roomName}
- Check-in Date: ${data.checkIn} (from 2:00 PM)
- Check-out Date: ${data.checkOut} (by 12:00 PM)
- Number of Guests: ${data.guestsCount}
- Estimated Total: ₦${data.estimatedTotal.toLocaleString("en-NG")}
- Special Requests / Arrival Notes: ${data.specialRequests || "None provided"}
- Booking Reference Code: ${reference}

Please craft an elegant, warm, concise, and highly professional automated reservation confirmation & concierge greeting letter.
Include:
1. Warm personal greeting to ${data.guestName}.
2. Clear confirmation of their reserved room (${data.roomName}) and stay dates.
3. Specific acknowledgement of their special requests (if any) or arrival arrangements.
4. Highlights of their stay at Banky Hotel & Suites (complimentary breakfast, 24/7 security, high-speed WiFi, open-air bar, Nigerian fine dining).
5. Simple next steps (our front desk has received this reservation, payment can be finalized seamlessly via Paystack or on arrival, and our team is reachable 24/7 on WhatsApp).

Tone: Courteous, refined Nigerian luxury hospitality, reassuring, and impeccably formatted. Keep it under 200 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.6,
        },
      });

      aiConfirmation =
        response.text?.trim() ||
        `Dear ${data.guestName},\n\nThank you for choosing Banky Hotel & Suites. We have received your reservation inquiry for the ${data.roomName} from ${data.checkIn} to ${data.checkOut} (Reference: ${reference}). Our front desk concierge is preparing for your arrival. We look forward to offering you our signature calm luxury and Ekiti hospitality.`;
    } catch (e) {
      console.warn("Gemini confirmation generation notice:", e);
      aiConfirmation = `Dear ${data.guestName},\n\nThank you for choosing Banky Hotel & Suites, Ado-Ekiti. We are delighted to confirm receipt of your reservation inquiry for the ${data.roomName} (Check-in: ${data.checkIn}, Check-out: ${data.checkOut}, Reference: ${reference}). Our reservations team will reach out shortly to ensure every detail of your stay is flawless.`;
    }

    // 2. Persist reservation inquiry to Firestore
    let savedId = "";
    try {
      const doc = await firestoreRest.create("reservations", {
        reference,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        room_slug: data.roomSlug,
        room_name: data.roomName,
        check_in: data.checkIn,
        check_out: data.checkOut,
        guests_count: data.guestsCount,
        total_amount: data.estimatedTotal,
        special_requests: data.specialRequests,
        ai_confirmation_message: aiConfirmation,
        status: "pending_confirmation",
        payment_status: "pending",
        source: "website_inquiry",
        created_at: new Date().toISOString(),
      });
      savedId = doc.id;
    } catch (e) {
      console.error("Failed to persist reservation inquiry to Firestore:", e);
    }

    return {
      ok: true,
      reference,
      id: savedId || reference,
      aiConfirmation,
      guestName: data.guestName,
      roomName: data.roomName,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      estimatedTotal: data.estimatedTotal,
      phone: data.guestPhone,
    };
  });

export const askHotelAi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        message: z.string().trim().min(1).max(1000),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "model"]),
              text: z.string(),
            }),
          )
          .optional()
          .default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGenAI();

      // Fetch live context about Banky Hotel rooms, amenities, and settings
      const [rooms, faqs, settingsDoc] = await Promise.all([
        firestoreRest.list<Record<string, unknown>>("rooms").catch(() => []),
        firestoreRest.list<Record<string, unknown>>("faqs").catch(() => []),
        firestoreRest.get<Record<string, unknown>>("site_settings", "default").catch(() => null),
      ]);

      const roomSummaries = rooms
        .map(
          (r) =>
            `- ${r["name"]}: ${r["category"] || "Room"}, ₦${Number(r["base_price_ngn"]).toLocaleString("en-NG")}/night. Amenities: ${Array.isArray(r["amenities"]) ? r["amenities"].join(", ") : "WiFi, AC, TV"}. Description: ${r["description"] || ""}`,
        )
        .join("\n");

      const faqSummaries = faqs.map((f) => `Q: ${f["question"]}\nA: ${f["answer"]}`).join("\n\n");

      const hotelName = (settingsDoc?.["hotel_name"] as string) || "Banky Hotel & Suites";
      const phone = (settingsDoc?.["phone"] as string) || "+234 800 000 0000";
      const address = (settingsDoc?.["address"] as string) || "Ado-Ekiti, Ekiti State, Nigeria";

      const systemInstruction = `You are the Google AI Virtual Concierge and Hospitality Assistant for ${hotelName}, located at ${address} (Contact: ${phone}).
Your duty is to warmly, politely, and accurately assist guests with inquiries about:
1. Room types, pricing, luxury suites (Diplomatic, Executive, Super Executive, Signature, Deluxe, Standard Plus), and amenities.
2. Hotel dining, restaurant & lounge menus, open bar garden, and signature dishes.
3. Event hosting, Banky Hall, conferences, banquets, and celebrations.
4. Booking process, check-in (2:00 PM), check-out (12:00 PM), payment options (Paystack / Direct Transfer / Cash at reception), and cancellation policies.
5. Local tourist recommendations in Ado-Ekiti and Ekiti State (Ikogosi Warm Springs, Arinta Waterfalls, Fajuyi Memorial Park, etc.).

Available Rooms & Rates:
${roomSummaries || "Standard, Deluxe, Executive, and Diplomatic Suites available from ₦25,000 to ₦95,000."}

Frequently Asked Questions:
${faqSummaries || "Standard hotel policies apply."}

Guidelines:
- Maintain a warm, hospitable, and professional tone.
- Give concise, clear, and helpful answers.
- Always recommend booking online via the website reserve page (/reserve) or contacting the front desk via WhatsApp or phone.`;

      const contents = [
        ...data.history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        {
          role: "user",
          parts: [{ text: data.message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return {
        reply:
          response.text ||
          "I am glad to assist you at Banky Hotel & Suites! How may I help you today?",
      };
    } catch (err: unknown) {
      console.error("Gemini AI error:", err);
      return {
        reply:
          "Welcome to Banky Hotel & Suites! Our front desk team is always delighted to assist you. You can browse our rooms directly on the website, reserve a stay, or contact our reception directly.",
      };
    }
  });
