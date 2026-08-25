import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #1B3D2F");

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await firestoreRest.get<Record<string, unknown>>("site_settings", "default");
  if (settings) return settings;
  const list = await firestoreRest.list<Record<string, unknown>>("site_settings");
  if (list.length > 0) return list[0];
  const { DEFAULT_SETTINGS } = await import("./branding");
  return DEFAULT_SETTINGS;
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string(),
        hotel_name: z.string().trim().min(2).max(120),
        tagline: z.string().trim().max(200),
        logo_url: z.string().max(10000),
        favicon_url: z.string().max(10000),
        color_primary: hex,
        color_accent: hex,
        color_background: hex,
        phone: z.string().trim().max(40),
        whatsapp: z
          .string()
          .trim()
          .regex(/^\d{8,15}$/, "Digits only, including country code"),
        email: z.string().trim().email(),
        address: z.string().trim().max(200),
        paystack_url: z.string().trim().url().max(400),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    await firestoreRest.patch("site_settings", id || "default", {
      ...patch,
      updated_at: new Date().toISOString(),
    });
    const { logAudit } = await import("./audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: (context.claims["email"] as string) ?? "",
      action: "cms.branding_updated",
      entity: "site_settings",
      entityId: id,
      details: { hotel_name: data.hotel_name, logo_url: data.logo_url },
    });
    return { ok: true };
  });

/** Uploads a base64 image and returns a data URL or image path. */
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        filename: z.string().trim().min(1).max(120),
        contentType: z
          .string()
          .regex(/^image\/(png|jpe?g|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)$/),
        dataBase64: z.string().min(16).max(8_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const dataUrl = `data:${data.contentType};base64,${data.dataBase64}`;
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-60);
    const path = `${new Date().getFullYear()}/${Date.now()}-${safe}`;

    const { logAudit } = await import("./audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: (context.claims["email"] as string) ?? "",
      action: "cms.media_uploaded",
      entity: "storage",
      entityId: path,
      details: { filename: data.filename },
    });
    return { url: dataUrl, path };
  });
