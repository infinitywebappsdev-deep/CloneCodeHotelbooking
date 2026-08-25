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

export const DEFAULT_POST_CATEGORIES = [
  "Hotel News",
  "Events & Banquets",
  "Dining & Nightlife",
  "Travel & Tourism",
  "Special Offers",
  "Press & Announcements",
] as const;

export const DEFAULT_MEDIA_FOLDERS = [
  {
    id: "rooms",
    name: "Rooms & Suites",
    description: "Suites, Deluxe & Standard rooms photography",
  },
  { id: "lobby", name: "Lobby & Reception", description: "Hotel reception, VIP lounges, foyer" },
  {
    id: "dining",
    name: "Restaurant & Dining",
    description: "Restaurant, breakfast buffet & dining areas",
  },
  {
    id: "bar",
    name: "Garden & Open-Air Bar",
    description: "Open air bar sitout, garden patio, nightlife",
  },
  {
    id: "events",
    name: "Banquet & Event Halls",
    description: "Banky Hall, conference rooms & setups",
  },
  {
    id: "exterior",
    name: "Exterior & Architecture",
    description: "Hotel facade, gates, parking & surroundings",
  },
  {
    id: "amenities",
    name: "Spa, Pool & Amenities",
    description: "Wellness spa, swimming pool, leisure facilities & amenities",
  },
  {
    id: "videos",
    name: "Videos & Virtual Tours",
    description: "Hotel video reels, walkthroughs & YouTube embeds",
  },
  { id: "uploads", name: "Custom Uploads", description: "Direct uploads and promotional assets" },
];

export const SEED_POSTS = [
  {
    id: "banky-hall-2026-bookings",
    slug: "banky-hall-2026-bookings",
    title: "Banky Hall Now Accepting 2026 Wedding & Conference Bookings",
    excerpt:
      "Discover how Banky Hotel & Suites elevates luxury weddings, corporate banquets, and executive summits in Ado-Ekiti with state-of-the-art acoustics and full catering.",
    body: `### Welcome to Banky Hall & Conference Center

Planning a grand wedding celebration, executive corporate summit, or private gala in Ekiti State? Banky Hall offers a sophisticated venue equipped with:

* **Capacity**: Accommodates up to 350 banquet guests or 500 theater-style attendees.
* **Modern Amenities**: High-fidelity sound systems, multi-zone LED mood lighting, and climate control.
* **Dedicated Banquet Team**: Full in-house culinary and beverage catering tailored to your menu preferences.
* **Ample Secure Parking**: 24/7 guarded premises and dedicated VIP valet assistance.

> "Our event coordinators work with you from concept to execution to ensure every milestone is unforgettable."

Contact our front desk or message us on WhatsApp to schedule a private venue walkthrough.`,
    featured_image: "/images/BankyHall.jpg",
    featured_video: "",
    category: "Events & Banquets",
    tags: ["weddings", "conference", "hall", "ado-ekiti", "events"],
    author_name: "Front Desk & Events Team",
    author_avatar: "",
    status: "published",
    published_at: "2026-08-01T10:00:00.000Z",
    meta_title: "Banky Hall Bookings for Weddings & Conferences — Banky Hotel & Suites",
    meta_description:
      "Book Banky Hall for weddings, annual general meetings, and banquets in Ado-Ekiti with luxury catering.",
    read_time: "3 min read",
    views_count: 245,
    sort_order: 1,
    published: true,
  },
  {
    id: "gourmet-dining-open-air-bar",
    slug: "gourmet-dining-open-air-bar",
    title: "Culinary Highlights: Discovering African & Continental Flavors at Banky Restaurant",
    excerpt:
      "From signature local delicacies to grilled specialties at our open-air garden sit-out, explore the vibrant culinary experience at Banky Hotel & Suites.",
    body: `### A Symphony of Flavors in Ado-Ekiti

At Banky Hotel & Suites, our master chefs take pride in crafting memorable dining experiences blending rich Nigerian culinary heritage with international standards.

#### Highlights of our Menu:
1. **Signature Native Soups**: Freshly prepared pounded yam with authentic Egusi, Efo Riro, or Seafood Okro.
2. **Open-Air Grills**: Succulent grilled fish, peppered snails, spicy goat meat (Asun), and crispy plantains served fresh at our garden bar.
3. **Continental Classics**: Tender steaks, pastas, and chef special breakfast buffets.

Visit our Restaurant & Bar daily from 7:00 AM to 11:00 PM, or order directly to your suite with 24/7 room service.`,
    featured_image: "/images/Restaurant 2.jpg",
    featured_video: "",
    category: "Dining & Nightlife",
    tags: ["dining", "restaurant", "open-air bar", "cuisine", "breakfast"],
    author_name: "Executive Chef",
    author_avatar: "",
    status: "published",
    published_at: "2026-08-10T14:30:00.000Z",
    meta_title: "Fine Dining & Garden Bar at Banky Hotel & Suites",
    meta_description:
      "Enjoy continental meals, authentic Nigerian cuisine, and garden bar grills in Ado-Ekiti.",
    read_time: "4 min read",
    views_count: 180,
    sort_order: 2,
    published: true,
  },
  {
    id: "ado-ekiti-travel-guide",
    slug: "ado-ekiti-travel-guide",
    title: "Ado-Ekiti Travel Guide: Top Attractions, Culture & Heritage",
    excerpt:
      "Plan your weekend getaway to Ekiti State with our curated concierge guide to natural springs, ancient hills, and local artisan crafts.",
    body: `### Exploring the Fountain of Knowledge

Ekiti State is renowned for its serene hilly landscapes, rich Yoruba history, and warm hospitality. When staying at Banky Hotel & Suites, you are ideally situated to explore:

* **Ikogosi Warm & Cold Springs**: A world-famous geological marvel where warm and cold springs meet.
* **Arinta Waterfalls**: Cascading natural waters surrounded by lush rain forests.
* **Olosunta & Fajuyi Memorial Parks**: Historic landmarks celebrating local culture and leadership.

Our 24/7 Concierge is always on hand to arrange guided transport, executive airport pickups, and local sightseeing itineraries.`,
    featured_image: "/images/hero-exterior.jpg",
    featured_video: "",
    category: "Travel & Tourism",
    tags: ["tourism", "travel", "ikogosi", "ado-ekiti", "sightseeing"],
    author_name: "Hotel Concierge",
    author_avatar: "",
    status: "published",
    published_at: "2026-08-15T09:00:00.000Z",
    meta_title: "Top Tourist Attractions in Ado-Ekiti — Banky Hotel Guide",
    meta_description:
      "Concierge recommendations for tourist sites, waterfalls, and cultural hubs around Ado-Ekiti.",
    read_time: "5 min read",
    views_count: 320,
    sort_order: 3,
    published: true,
  },
];

export const cmsLoad = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [pages, posts, gallery, faqs, mediaAssets, mediaFolders, siteSections] =
      await Promise.all([
        firestoreRest.list<Record<string, unknown>>("pages"),
        firestoreRest.list<Record<string, unknown>>("posts"),
        firestoreRest.list<Record<string, unknown>>("gallery_images"),
        firestoreRest.list<Record<string, unknown>>("faqs"),
        firestoreRest.list<Record<string, unknown>>("media_assets"),
        firestoreRest.list<Record<string, unknown>>("media_folders"),
        firestoreRest.list<Record<string, unknown>>("site_sections"),
      ]);

    // Ensure starter posts if empty
    let finalPosts = posts;
    if (posts.length === 0) {
      finalPosts = SEED_POSTS as unknown as Record<string, unknown>[];
    }

    // Ensure starter folders if empty
    let finalFolders = mediaFolders;
    if (mediaFolders.length === 0) {
      finalFolders = DEFAULT_MEDIA_FOLDERS as unknown as Record<string, unknown>[];
    }

    pages.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
    finalPosts.sort((a, b) =>
      String(b["published_at"] || b["created_at"] || "").localeCompare(
        String(a["published_at"] || a["created_at"] || ""),
      ),
    );
    gallery.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));
    faqs.sort((a, b) => Number(a["sort_order"] || 0) - Number(b["sort_order"] || 0));

    return {
      pages,
      posts: finalPosts,
      gallery,
      faqs,
      mediaAssets,
      mediaFolders: finalFolders,
      siteSections,
    };
  });

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

/* =========================================================================
   PAGES CMS (WordPress Pages)
   ========================================================================= */

export const savePage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string(),
        title: z.string().max(200),
        subtitle: z.string().max(300).default(""),
        body: z.string().max(50000),
        featured_image: z.string().default(""),
        featured_video: z.string().default(""),
        template: z.enum(["standard", "hero", "split", "fullwidth"]).default("standard"),
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
        body: z.string().max(50000).default(""),
        featured_image: z.string().default(""),
        featured_video: z.string().default(""),
        template: z.enum(["standard", "hero", "split", "fullwidth"]).default("standard"),
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
    if (existing) throw new Error(`A page with the address /p/${data.slug} already exists.`);

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

/* ---------- Page Drafts & Revisions ---------- */

const pageContentSchema = z.object({
  title: z.string().max(200),
  subtitle: z.string().max(300).default(""),
  body: z.string().max(50000),
  featured_image: z.string().default(""),
  featured_video: z.string().default(""),
  template: z.string().default("standard"),
  meta_description: z.string().max(300).default(""),
  nav_label: z.string().max(60).default(""),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

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
      featured_image: current["featured_image"] ?? "",
      featured_video: current["featured_video"] ?? "",
      template: current["template"] ?? "standard",
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

/* =========================================================================
   POSTS / NEWS & ARTICLES CMS (WordPress Posts)
   ========================================================================= */

const postSchema = z.object({
  title: z.string().trim().min(2).max(250),
  slug: slugSchema,
  excerpt: z.string().max(600).default(""),
  body: z.string().max(50000).default(""),
  featured_image: z.string().default(""),
  featured_video: z.string().default(""),
  category: z.string().trim().min(1).max(100).default("Hotel News"),
  tags: z.array(z.string()).default([]),
  author_name: z.string().max(100).default("Banky Hotel Editorial"),
  author_avatar: z.string().default(""),
  status: z.enum(["published", "draft", "scheduled"]).default("published"),
  published_at: z.string().default(() => new Date().toISOString()),
  meta_title: z.string().max(250).default(""),
  meta_description: z.string().max(350).default(""),
  read_time: z.string().max(50).default("3 min read"),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const posts = await firestoreRest.list<Record<string, unknown>>("posts");
    if (posts.length === 0) {
      return SEED_POSTS;
    }
    return posts.sort((a, b) =>
      String(b["published_at"] || b["created_at"] || "").localeCompare(
        String(a["published_at"] || a["created_at"] || ""),
      ),
    );
  });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: { idOrSlug: string }) => parseFriendly(z.object({ idOrSlug: z.string() }), d))
  .handler(async ({ data }) => {
    const posts = await firestoreRest.list<Record<string, unknown>>("posts");
    const all = posts.length > 0 ? posts : (SEED_POSTS as unknown as Record<string, unknown>[]);
    const found = all.find((p) => p["id"] === data.idOrSlug || p["slug"] === data.idOrSlug);
    return found ?? null;
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => parseFriendly(postSchema, d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const posts = await firestoreRest.list<Record<string, unknown>>("posts");
    const existing = posts.find((p) => p["slug"] === data.slug);
    if (existing) {
      throw new Error(
        `A post with the URL slug "${data.slug}" already exists. Please choose a unique slug.`,
      );
    }

    const created = await firestoreRest.create("posts", {
      ...data,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await audit(context, "cms.post_created", "posts", created.id, {
      title: data.title,
      slug: data.slug,
      category: data.category,
    });
    return created;
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => parseFriendly(postSchema.extend({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...patch } = data;
    await firestoreRest.patch("posts", id, {
      ...patch,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.post_updated", "posts", id, {
      title: data.title,
      slug: data.slug,
    });
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const post = await firestoreRest.get<Record<string, unknown>>("posts", data.id);
    await firestoreRest.delete("posts", data.id);
    await audit(context, "cms.post_deleted", "posts", data.id, {
      slug: (post?.["slug"] as string) ?? "",
      title: (post?.["title"] as string) ?? "",
    });
    return { ok: true };
  });

/* =========================================================================
   MEDIA LIBRARY & ASSET FOLDERS CMS
   ========================================================================= */

const mediaAssetSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().min(1).max(15_000_000), // allows base64 or public URLs
  thumbnail_url: z.string().default(""),
  file_type: z.enum(["image", "video", "document", "audio"]).default("image"),
  mime_type: z.string().default("image/jpeg"),
  file_size: z.number().int().min(0).default(0), // bytes
  file_size_formatted: z.string().default(""),
  dimensions: z.string().default(""), // e.g. "1920x1080"
  folder_id: z.string().default("uploads"),
  folder_name: z.string().default("Custom Uploads"),
  alt_text: z.string().max(250).default(""),
  caption: z.string().max(500).default(""),
  tags: z.array(z.string()).default([]),
});

export const listMediaAssets = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const assets = await firestoreRest.list<Record<string, unknown>>("media_assets");
    return assets.sort((a, b) =>
      String(b["created_at"] ?? "").localeCompare(String(a["created_at"] ?? "")),
    );
  });

export const saveMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      mediaAssetSchema.extend({
        id: z.string().optional(),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { id, ...values } = data;
    if (id) {
      await firestoreRest.patch("media_assets", id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
      await audit(context, "media.asset_updated", "media_assets", id, { title: data.title });
      return { ok: true, id };
    } else {
      const created = await firestoreRest.create("media_assets", {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await audit(context, "media.asset_uploaded", "media_assets", created.id, {
        title: data.title,
        file_type: data.file_type,
        folder: data.folder_name,
      });
      return { ok: true, id: created.id };
    }
  });

export const deleteMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("media_assets", data.id);
    await audit(context, "media.asset_deleted", "media_assets", data.id);
    return { ok: true };
  });

/* ---------- Custom Media Folders ---------- */

export const listMediaFolders = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const folders = await firestoreRest.list<Record<string, unknown>>("media_folders");
    if (folders.length === 0) {
      return DEFAULT_MEDIA_FOLDERS;
    }
    return folders;
  });

export const createMediaFolder = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        name: z.string().trim().min(2).max(80),
        description: z.string().max(200).default(""),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const created = await firestoreRest.create("media_folders", {
      id: slug,
      name: data.name,
      description: data.description,
      created_at: new Date().toISOString(),
    });
    await audit(context, "media.folder_created", "media_folders", created.id, { name: data.name });
    return created;
  });

export const deleteMediaFolder = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: { id: string }) => parseFriendly(z.object({ id: z.string() }), d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.delete("media_folders", data.id);
    await audit(context, "media.folder_deleted", "media_folders", data.id);
    return { ok: true };
  });

/* =========================================================================
   SITE CUSTOMIZER & GLOBAL SECTIONS CMS
   ========================================================================= */

export const DEFAULT_SITE_SECTIONS = {
  hero: {
    eyebrow: "Banky Hotel & Suites",
    headline: "Boutique Hospitality in the Heart of Ado-Ekiti",
    tagline:
      "Experience refined elegance, exceptional dining, and peaceful retreat. Tailored for corporate executives, wedding celebrations, and leisurely escapes.",
    media_type: "video", // 'video' | 'image'
    background_image: "/images/hero.jpg",
    background_video: "",
    primary_cta_label: "Reserve a Suite",
    primary_cta_link: "/reserve",
    secondary_cta_label: "Explore Rooms",
    secondary_cta_link: "/rooms",
  },
  ticker: {
    messages: [
      "Direct booking benefit — complimentary chef breakfast for two",
      "Banky Hall now reserving 2026 wedding & conference dates",
      "24/7 Concierge & Executive Airport Pickup available",
    ],
  },
  about_story: {
    title: "A Haven of Serenity & Distinction",
    lead: "Set in a tranquil and secure neighborhood of Ado-Ekiti, Banky Hotel & Suites combines warm Nigerian hospitality with contemporary comfort.",
    story:
      "From high-thread-count linens in our spacious suites to artisanal dining at our restaurant and lively evening cocktails at the garden bar, every detail is tailored for guest delight.",
    highlight_stats: [
      { label: "Suites & Rooms", value: "35+" },
      { label: "Event Capacity", value: "350" },
      { label: "Guest Satisfaction", value: "99%" },
      { label: "Dedicated Staff", value: "24/7" },
    ],
  },
  amenities: {
    title: "Signature Amenities",
    items: [
      {
        icon: "Shield",
        title: "24/7 Guarded Security",
        description: "CCTV surveillance & perimeter safety",
      },
      {
        icon: "Wifi",
        title: "High-Speed Wi-Fi",
        description: "Complimentary ultra-fast internet in all suites",
      },
      {
        icon: "Utensils",
        title: "Fine Dining Restaurant",
        description: "Local delicacies & continental menus",
      },
      {
        icon: "Wine",
        title: "Open-Air Garden Bar",
        description: "Evening cocktails, barbecue & lounge vibes",
      },
      {
        icon: "Users",
        title: "Banky Event Hall",
        description: "Banquets, conferences & wedding receptions",
      },
      {
        icon: "Zap",
        title: "24/7 Guaranteed Power",
        description: "Dual automated backup generators",
      },
    ],
  },
};

export const getSiteSections = createServerFn({ method: "GET" }).handler(async () => {
  const sections = await firestoreRest.list<Record<string, unknown>>("site_sections");
  const map: Record<string, unknown> = { ...DEFAULT_SITE_SECTIONS };
  for (const s of sections) {
    if (s["id"] && s["data"]) {
      map[s["id"] as string] = s["data"];
    }
  }
  return map;
});

export const saveSiteSection = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        section_id: z.string().min(1),
        data: z.record(z.unknown()),
      }),
      d,
    ),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    await firestoreRest.patch("site_sections", data.section_id, {
      id: data.section_id,
      data: data.data,
      updated_at: new Date().toISOString(),
    });
    await audit(context, "cms.section_updated", "site_sections", data.section_id, {
      section: data.section_id,
    });
    return { ok: true };
  });

/* =========================================================================
   FAQS CMS
   ========================================================================= */

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

/* =========================================================================
   GALLERY CMS
   ========================================================================= */

export const saveGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    parseFriendly(
      z.object({
        id: z.string().optional(),
        url: z.string().trim().min(1).max(15_000_000),
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

/* =========================================================================
   F&B RESTAURANT & BAR MENU CMS
   ========================================================================= */

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

/* =========================================================================
   PROMOTIONAL COUPONS & VOUCHERS CMS
   ========================================================================= */

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

/* =========================================================================
   STAFF DISPATCHES & BROADCAST ALERTS
   ========================================================================= */

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

/* =========================================================================
   GUEST TESTIMONIALS & REVIEWS MODERATION
   ========================================================================= */

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
