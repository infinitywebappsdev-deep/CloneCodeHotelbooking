import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { firestoreRest } from "./firebase-server";
import { z } from "zod";
import { parseFriendly } from "./cms-validation";
import { assertStaff } from "./auth-roles";

async function audit(
  context: { userId: string; claims: Record<string, unknown> },
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  const { logAudit } = await import("./audit.server");
  await logAudit({
    actorId: context.userId,
    actorEmail: (context.claims?.["email"] as string) ?? "",
    action,
    entity,
    entityId,
    details,
  });
}

export const cmsLoad = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [pages, gallery, faqs] = await Promise.all([
      firestoreRest.list<Record<string, unknown>>("pages"),
      firestoreRest.list<Record<string, unknown>>("gallery_images"),
      firestoreRest.list<Record<string, unknown>>("faqs"),
    ]);
    pages.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
    gallery.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
    faqs.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
    return { pages, gallery, faqs };
  });

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const savePage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string(),
        title: z.string().max(200),
        subtitle: z.string().max(300),
        body: z.string().max(20000),
        meta_description: z.string().max(300),
        nav_label: z.string().max(60).default(""),
        sort_order: z.number().int().min(0).max(999).default(0),
        published: z.boolean().default(true),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    await firestoreRest.patch("pages", id, {
      ...patch,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_updated", "pages", id, { title: data.title });
    return { ok: true };
  });

export const createPage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        slug: slugSchema,
        title: z.string().trim().min(2).max(200),
        subtitle: z.string().max(300).default(""),
        body: z.string().max(20000).default(""),
        meta_description: z.string().max(300).default(""),
        nav_label: z.string().max(60).default(""),
        sort_order: z.number().int().min(0).max(999).default(0),
        published: z.boolean().default(true),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const allPages = await firestoreRest.list<Record<string, unknown>>("pages");
    const existing = allPages.find((p) => p["slug"] === data.slug);
    if (existing) throw new Error(`A page with the address /${data.slug} already exists.`);

    const created = await firestoreRest.create("pages", {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_created", "pages", created.id, {
      slug: data.slug,
      title: data.title,
    });
    return created;
  });

export const deletePage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const page = await firestoreRest.get<Record<string, unknown>>("pages", data.id);
    await firestoreRest.delete("pages", data.id);
    await audit(context, "cms.page_deleted", "pages", data.id, {
      slug: (page?.["slug"] as string) ?? "",
    });
    return { ok: true };
  });

export const saveFaq = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string().optional(),
        question: z.string().trim().min(3).max(300),
        answer: z.string().trim().min(3).max(3000),
        sort_order: z.number().int().min(0).max(999),
        published: z.boolean(),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...values } = data;
    if (id) {
      await firestoreRest.patch("faqs", id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
    } else {
      await firestoreRest.create("faqs", {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    await audit(context, id ? "cms.faq_updated" : "cms.faq_created", "faqs", id ?? "", {
      question: data.question,
    });
    return { ok: true };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("faqs", data.id);
    await audit(context, "cms.faq_deleted", "faqs", data.id);
    return { ok: true };
  });

export const saveGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string().optional(),
        url: z.string().trim().min(1).max(10_000_000),
        caption: z.string().max(200),
        category: z.string().max(60),
        sort_order: z.number().int().min(0).max(999),
        published: z.boolean(),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...values } = data;
    if (id) {
      await firestoreRest.patch("gallery_images", id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
    } else {
      await firestoreRest.create("gallery_images", {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    await audit(
      context,
      id ? "cms.gallery_updated" : "cms.gallery_created",
      "gallery_images",
      id ?? "",
      {
        caption: data.caption,
      },
    );
    return { ok: true };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("gallery_images", data.id);
    await audit(context, "cms.gallery_deleted", "gallery_images", data.id);
    return { ok: true };
  });

/* ---------- Page drafts, publish history and rollback ---------- */

const pageContentSchema = z.object({
  title: z.string().max(200),
  subtitle: z.string().max(300),
  body: z.string().max(20000),
  meta_description: z.string().max(300),
  nav_label: z.string().max(60).default(""),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

/** Snapshots the page as it is right now into the version history. */
async function snapshotPage(
  context: { userId: string; claims: Record<string, unknown> },
  pageId: string,
  note: string,
) {
  const current = await firestoreRest.get<Record<string, unknown>>("pages", pageId);
  if (!current) return;
  const allVersions = await firestoreRest.list<Record<string, unknown>>("page_versions");
  const count = allVersions.filter((v) => v["page_id"] === pageId).length;

  await firestoreRest.create("page_versions", {
    page_id: pageId,
    version: count + 1,
    snapshot: {
      title: current["title"],
      subtitle: current["subtitle"],
      body: current["body"],
      meta_description: current["meta_description"],
      nav_label: current["nav_label"],
      sort_order: current["sort_order"],
      published: current["published"],
    },
    note,
    actor_id: context.userId,
    actor_email: (context.claims?.["email"] as string) ?? "",
    created_at: new Date().toISOString(),
  });
}

export const savePageDraft = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => parseFriendly(pageContentSchema.extend({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...draft } = data;
    await firestoreRest.patch("pages", id, {
      draft,
      draft_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_draft_saved", "pages", id, { title: data.title });
    return { ok: true };
  });

export const discardPageDraft = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.patch("pages", data.id, {
      draft: null,
      draft_updated_at: null,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_draft_discarded", "pages", data.id);
    return { ok: true };
  });

/** Publishes the stored draft (or supplied values) and records the previous version. */
export const publishPage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(pageContentSchema.partial().extend({ id: z.string() }), d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...supplied } = data;
    const page = await firestoreRest.get<Record<string, unknown>>("pages", id);
    const values = (
      Object.keys(supplied).length > 0 ? supplied : (page?.["draft"] ?? null)
    ) as Record<string, unknown> | null;
    if (!values) throw new Error("There is nothing to publish — save a draft first.");
    await snapshotPage(context, id, "Version before publish");
    await firestoreRest.patch("pages", id, {
      ...values,
      draft: null,
      draft_updated_at: null,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_published", "pages", id, {
      slug: (page?.["slug"] as string) ?? "",
    });
    return { ok: true };
  });

export const listPageVersions = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { pageId: string }) => parseFriendly(z.object({ pageId: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const rows = await firestoreRest.list<Record<string, unknown>>("page_versions");
    const versions = rows.filter((r) => r["page_id"] === data.pageId);
    versions.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
    return versions.slice(0, 30);
  });

/** One-click rollback: restores a previous version and keeps the current one in history. */
export const rollbackPage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { versionId: string }) =>
    parseFriendly(z.object({ versionId: z.string() }), d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const version = await firestoreRest.get<Record<string, unknown>>(
      "page_versions",
      data.versionId,
    );
    if (!version) throw new Error("That version is no longer available.");
    const pageId = String(version["page_id"]);
    await snapshotPage(context, pageId, "Version before rollback");
    await firestoreRest.patch("pages", pageId, {
      ...(version["snapshot"] as Record<string, unknown>),
      draft: null,
      draft_updated_at: null,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.page_rolled_back", "pages", pageId, {
      restored_version: version["version"],
    });
    return { ok: true };
  });

/* ---------- F&B Restaurant & Bar Menu CMS ---------- */

export const listMenuItems = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const items = await firestoreRest.list<Record<string, unknown>>("menu_items");
    return items.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
  });

export const saveMenuItem = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(2).max(120),
        category: z.string().trim().min(2).max(80),
        description: z.string().max(500).default(""),
        price: z.number().int().min(0).max(10_000_000),
        in_stock: z.boolean().default(true),
        tags: z.array(z.string()).default([]),
        sort_order: z.number().int().min(0).max(999).default(0),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...values } = data;
    if (id) {
      await firestoreRest.patch("menu_items", id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
      await audit(context, "cms.menu_item_updated", "menu_items", id, { name: data.name });
    } else {
      const created = await firestoreRest.create("menu_items", {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await audit(context, "cms.menu_item_created", "menu_items", created.id, { name: data.name });
    }
    return { ok: true };
  });

export const deleteMenuItem = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("menu_items", data.id);
    await audit(context, "cms.menu_item_deleted", "menu_items", data.id);
    return { ok: true };
  });

/* ---------- Promotional Coupons & Discount Vouchers CMS ---------- */

export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const rows = await firestoreRest.list<Record<string, unknown>>("coupons");
    return rows.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
  });

export const saveCoupon = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string().optional(),
        code: z
          .string()
          .trim()
          .min(3)
          .max(30)
          .transform((v) => v.toUpperCase()),
        discount_type: z.enum(["percentage", "fixed"]),
        discount_value: z.number().int().min(1),
        min_spend: z.number().int().min(0).default(0),
        max_uses: z.number().int().min(1).default(100),
        uses_count: z.number().int().min(0).default(0),
        valid_until: z.string().default(""),
        active: z.boolean().default(true),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...values } = data;
    if (id) {
      await firestoreRest.patch("coupons", id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
      await audit(context, "cms.coupon_updated", "coupons", id, { code: data.code });
    } else {
      const created = await firestoreRest.create("coupons", {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await audit(context, "cms.coupon_created", "coupons", created.id, { code: data.code });
    }
    return { ok: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("coupons", data.id);
    await audit(context, "cms.coupon_deleted", "coupons", data.id);
    return { ok: true };
  });

/* ---------- Staff Manual Push Notifications & High-Priority Alerts ---------- */

export const listStaffDispatches = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const rows = await firestoreRest.list<Record<string, unknown>>("staff_dispatches");
    return rows.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
  });

export const broadcastStaffAlert = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        priority: z.enum(["urgent", "high", "normal", "announcement"]),
        department: z.enum(["all", "front_desk", "housekeeping", "maintenance", "kitchen"]),
        category: z.string().trim().min(2).max(100),
        title: z.string().trim().min(3).max(150),
        message: z.string().trim().min(5).max(1500),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const record = await firestoreRest.create("staff_dispatches", {
      ...data,
      sender_id: context.userId,
      sender_email: (context.claims?.["email"] as string) ?? "",
      status: "broadcasted",
      created_at: new Date().toISOString(),
    });
    await audit(context, "staff.alert_broadcasted", "staff_dispatches", record.id, {
      priority: data.priority,
      title: data.title,
    });
    return { ok: true, id: record.id };
  });

/* ---------- Guest Reviews & Testimonials Moderation ---------- */

export const listAdminTestimonials = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const rows = await firestoreRest.list<Record<string, unknown>>("testimonials");
    return rows.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
  });

export const moderateTestimonial = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string(),
        verified: z.boolean().optional(),
        featured: z.boolean().optional(),
        staff_response: z.string().max(1000).optional(),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...updates } = data;
    await firestoreRest.patch("testimonials", id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "testimonials.moderated", "testimonials", id, updates);
    return { ok: true };
  });

export const deleteAdminTestimonial = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("testimonials", data.id);
    await audit(context, "testimonials.deleted", "testimonials", data.id);
    return { ok: true };
  });
