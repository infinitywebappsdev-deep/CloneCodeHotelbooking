import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firestoreRest } from "./firebase-server";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: "unread" | "read" | "replied" | "archived";
  created_at: string;
  source?: string;
}

export const contactInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please provide your name (at least 2 characters)")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address (e.g. name@example.com)")
    .max(120, "Email cannot exceed 120 characters"),
  subject: z
    .string()
    .trim()
    .min(2, "Please provide a subject for your enquiry")
    .max(200, "Subject cannot exceed 200 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Please provide a message with at least 10 characters")
    .max(3000, "Message cannot exceed 3,000 characters"),
  phone: z.string().trim().max(40, "Phone cannot exceed 40 characters").optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactInputSchema.parse(d))
  .handler(async ({ data }) => {
    const timestamp = new Date().toISOString();
    const doc = await firestoreRest.create<ContactSubmission>("contacts", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      phone: data.phone || "",
      status: "unread",
      created_at: timestamp,
      source: "contact_page",
    });

    return {
      ok: true,
      id: doc.id,
      message: "Thank you for reaching out! Our reception desk has received your message.",
      created_at: timestamp,
    };
  });

export const listContactSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const list = await firestoreRest.list<ContactSubmission>("contacts");
    if (list && list.length > 0) {
      return list.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
    }
  } catch (err) {
    console.warn("Could not fetch contacts list:", err);
  }
  return [];
});

export const updateContactStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1),
        status: z.enum(["unread", "read", "replied", "archived"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await firestoreRest.patch("contacts", data.id, {
      status: data.status,
    });
    return { ok: true };
  });

export const deleteContactSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await firestoreRest.delete("contacts", data.id);
    return { ok: true };
  });
