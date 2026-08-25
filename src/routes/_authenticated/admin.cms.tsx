import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  cmsLoad,
  savePage,
  saveFaq,
  deleteFaq,
  saveGalleryImage,
  deleteGalleryImage,
  createPage,
  deletePage,
  listMenuItems,
  saveMenuItem,
  deleteMenuItem,
  listCoupons,
  saveCoupon,
  deleteCoupon,
  listAdminTestimonials,
  moderateTestimonial,
  deleteAdminTestimonial,
} from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Star,
  CheckCircle,
  Trash2,
  Utensils,
  Tag,
  MessageSquare,
  Images,
  Mail,
  Phone,
  Clock,
  Search,
  Archive,
  Check,
} from "lucide-react";
import { MediaImagePicker, MediaLibraryBrowser } from "@/components/admin/MediaImagePicker";
import {
  listContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  type ContactSubmission,
} from "@/lib/contact.functions";
import { whatsappLink } from "@/lib/hotel";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: CmsPage,
});

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

type Page = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  meta_description: string;
  nav_label: string;
  sort_order: number;
  published: boolean;
};
type Faq = { id: string; question: string; answer: string; sort_order: number; published: boolean };
type Image = {
  id: string;
  url: string;
  caption: string;
  category: string;
  sort_order: number;
  published: boolean;
};

function CmsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["cms"], queryFn: () => cmsLoad() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cms"] });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading content…</p>;

  return (
    <Tabs defaultValue="pages" className="space-y-4">
      <TabsList className="grid grid-cols-4 sm:grid-cols-8 gap-1 h-auto p-1">
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="media" className="gap-1">
          <Images className="h-3.5 w-3.5" />
          Media Library
        </TabsTrigger>
        <TabsTrigger value="faqs">FAQs</TabsTrigger>
        <TabsTrigger value="menu">F&B Menu</TabsTrigger>
        <TabsTrigger value="coupons">Vouchers</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="inquiries" className="gap-1">
          <Mail className="h-3.5 w-3.5" />
          Inquiries
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pages" className="space-y-4">
        <NewPage onSaved={refresh} />
        {(data.pages as Page[]).map((page) => (
          <PageEditor key={page.id} page={page} onSaved={refresh} />
        ))}
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <ImageEditor
          image={{
            id: "",
            url: "",
            caption: "",
            category: "hotel",
            sort_order: 99,
            published: true,
          }}
          onSaved={refresh}
          isNew
        />
        <div className="grid gap-4 md:grid-cols-2">
          {(data.gallery as Image[]).map((image) => (
            <ImageEditor key={image.id} image={image} onSaved={refresh} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="media" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-serif font-semibold">Website Media & Asset Folders</h2>
          <p className="text-xs text-muted-foreground">
            Browse all high-resolution photography stored in the project's code and public folders.
            Click any image to preview, copy its public web path, or copy its direct asset URL for
            pages, rooms, or marketing.
          </p>
        </div>
        <MediaLibraryBrowser />
      </TabsContent>

      <TabsContent value="faqs" className="space-y-4">
        <FaqEditor
          faq={{ id: "", question: "", answer: "", sort_order: 99, published: true }}
          onSaved={refresh}
          isNew
        />
        {(data.faqs as Faq[]).map((faq) => (
          <FaqEditor key={faq.id} faq={faq} onSaved={refresh} />
        ))}
      </TabsContent>

      <TabsContent value="menu" className="space-y-4">
        <MenuManager />
      </TabsContent>

      <TabsContent value="coupons" className="space-y-4">
        <CouponManager />
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        <ReviewsModerator />
      </TabsContent>

      <TabsContent value="inquiries" className="space-y-4">
        <ContactInquiriesModerator />
      </TabsContent>
    </Tabs>
  );
}

function PageEditor({ page, onSaved }: { page: Page; onSaved: () => void }) {
  const [draft, setDraft] = useState(page);
  const save = useMutation({
    mutationFn: () =>
      savePage({
        data: {
          id: draft.id,
          title: draft.title,
          subtitle: draft.subtitle,
          body: draft.body,
          meta_description: draft.meta_description,
          nav_label: draft.nav_label ?? "",
          sort_order: Number(draft.sort_order ?? 0),
          published: draft.published ?? true,
        } as never,
      }),
    onSuccess: () => {
      toast.success(`/${draft.slug} published.`);
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">/{draft.slug}</p>
        <div>
          <Label>Title</Label>
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Input
            value={draft.subtitle}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
          />
        </div>
        <div>
          <Label>Body</Label>
          <Textarea
            rows={8}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          />
        </div>
        <div>
          <Label>Meta description (SEO)</Label>
          <Textarea
            rows={2}
            value={draft.meta_description}
            onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Menu label (blank = hidden)</Label>
            <Input
              value={draft.nav_label ?? ""}
              onChange={(e) => setDraft({ ...draft, nav_label: e.target.value })}
            />
          </div>
          <div>
            <Label>Order</Label>
            <Input
              type="number"
              value={draft.sort_order ?? 0}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={draft.published ?? true}
              onCheckedChange={(published) => setDraft({ ...draft, published })}
            />
            <span className="text-xs">{(draft.published ?? true) ? "Published" : "Hidden"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Publishing…" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (!confirm(`Delete the page /${draft.slug}? This cannot be undone.`)) return;
              await deletePage({ data: { id: draft.id } });
              toast.success("Page deleted.");
              onSaved();
            }}
          >
            Delete page
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-background p-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Live preview
        </p>
        <h2 className="font-serif text-3xl">{draft.title || "Untitled page"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{draft.subtitle}</p>
        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          {draft.body
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </div>
    </Card>
  );
}

function FaqEditor({ faq, onSaved, isNew }: { faq: Faq; onSaved: () => void; isNew?: boolean }) {
  const [draft, setDraft] = useState(faq);
  const save = useMutation({
    mutationFn: () =>
      saveFaq({
        data: {
          ...(draft.id ? { id: draft.id } : {}),
          question: draft.question,
          answer: draft.answer,
          sort_order: Number(draft.sort_order),
          published: draft.published,
        } as never,
      }),
    onSuccess: () => {
      toast.success("FAQ published.");
      if (isNew) setDraft(faq);
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="space-y-3 p-5">
      {isNew && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Add a new FAQ</p>
      )}
      <div>
        <Label>Question</Label>
        <Input
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
        />
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          rows={3}
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-28">
          <Label>Order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
          <span className="text-xs">{draft.published ? "Published" : "Hidden"}</span>
        </div>
        <div className="ml-auto flex gap-2 pt-5">
          {!isNew && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await deleteFaq({ data: { id: draft.id } });
                toast.success("FAQ removed.");
                onSaved();
              }}
            >
              Delete
            </Button>
          )}
          <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
            {isNew ? "Add FAQ" : "Publish"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ImageEditor({
  image,
  onSaved,
  isNew,
}: {
  image: Image;
  onSaved: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState(image);
  const save = useMutation({
    mutationFn: () =>
      saveGalleryImage({
        data: {
          ...(draft.id ? { id: draft.id } : {}),
          url: draft.url,
          caption: draft.caption,
          category: draft.category,
          sort_order: Number(draft.sort_order),
          published: draft.published,
        } as never,
      }),
    onSuccess: () => {
      toast.success("Gallery updated.");
      if (isNew) setDraft(image);
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="space-y-4 p-5">
      {isNew && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Add a new gallery item
        </p>
      )}

      <MediaImagePicker
        value={draft.url}
        onChange={(url) => setDraft({ ...draft, url })}
        label="Select Image (Project Folders, Upload from Computer, or YouTube Video Cover)"
        placeholder="/images/... or https://..."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Caption</Label>
          <Input
            value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-24">
          <Label>Order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
          <span className="text-xs">{draft.published ? "Published" : "Hidden"}</span>
        </div>
        <div className="ml-auto flex gap-2 pt-5">
          {!isNew && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await deleteGalleryImage({ data: { id: draft.id } });
                toast.success("Image removed.");
                onSaved();
              }}
            >
              Delete
            </Button>
          )}
          <Button size="sm" disabled={save.isPending || !draft.url} onClick={() => save.mutate()}>
            {isNew ? "Add image" : "Publish"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NewPage({ onSaved }: { onSaved: () => void }) {
  const [draft, setDraft] = useState({
    slug: "",
    title: "",
    subtitle: "",
    body: "",
    meta_description: "",
    nav_label: "",
    sort_order: 10,
    published: true,
  });
  const save = useMutation({
    mutationFn: () =>
      createPage({ data: { ...draft, sort_order: Number(draft.sort_order) } as never }),
    onSuccess: () => {
      toast.success(`Page created — it is live at /p/${draft.slug}`);
      setDraft({
        slug: "",
        title: "",
        subtitle: "",
        body: "",
        meta_description: "",
        nav_label: "",
        sort_order: 10,
        published: true,
      });
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="space-y-3 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Add a new page</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Page title</Label>
          <Input
            value={draft.title}
            onChange={(e) =>
              setDraft({
                ...draft,
                title: e.target.value,
                slug:
                  draft.slug ||
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
              })
            }
          />
        </div>
        <div>
          <Label>Web address</Label>
          <Input
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            placeholder="spa-and-wellness"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Will be live at /p/{draft.slug || "your-page"}
          </p>
        </div>
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={draft.subtitle}
          onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
        />
      </div>
      <div>
        <Label>Body</Label>
        <Textarea
          rows={5}
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Menu label (optional)</Label>
          <Input
            value={draft.nav_label}
            onChange={(e) => setDraft({ ...draft, nav_label: e.target.value })}
          />
        </div>
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
          <span className="text-xs">{draft.published ? "Published" : "Hidden"}</span>
        </div>
      </div>
      <Button
        size="sm"
        disabled={save.isPending || !draft.title || !draft.slug}
        onClick={() => save.mutate()}
      >
        {save.isPending ? "Creating…" : "Create page"}
      </Button>
    </Card>
  );
}

/* =========================================================================
   F&B MENU MANAGER
   ========================================================================= */

type MenuItemRecord = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  in_stock: boolean;
  tags: string[];
  sort_order: number;
};

const MENU_CATEGORIES = [
  "Soups & Swallows",
  "Rice Specialties",
  "Grills & Asun",
  "Starters & Bites",
  "Peppersoup Corner",
  "Quick Meals",
  "Desserts & Pastries",
  "Bar & Signature Cocktails",
];

function MenuManager() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cms-menu"],
    queryFn: () => listMenuItems() as Promise<MenuItemRecord[]>,
  });

  const [editingItem, setEditingItem] = useState<MenuItemRecord>({
    name: "",
    category: "Soups & Swallows",
    description: "",
    price: 3500,
    in_stock: true,
    tags: ["Chef's Special"],
    sort_order: 1,
  });

  const save = useMutation({
    mutationFn: () => saveMenuItem({ data: editingItem }),
    onSuccess: () => {
      toast.success("Menu item saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["cms-menu"] });
      setEditingItem({
        name: "",
        category: "Soups & Swallows",
        description: "",
        price: 3500,
        in_stock: true,
        tags: [],
        sort_order: (items.length || 0) + 1,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuItem({ data: { id } }),
    onSuccess: () => {
      toast.success("Menu item deleted.");
      queryClient.invalidateQueries({ queryKey: ["cms-menu"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading menu items…</p>;

  return (
    <div className="space-y-6">
      {/* Create / Edit Form */}
      <Card className="p-5 border-primary/20 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">
            {editingItem.id ? "Edit Menu Item" : "Add New Dish / Beverage"}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Dish / Item Name</Label>
            <Input
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              placeholder="e.g. Ekiti Pounded Yam & Goat Meat Egusi"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={editingItem.category}
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Price (₦ NGN)</Label>
            <Input
              type="number"
              value={editingItem.price}
              onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Display Order</Label>
            <Input
              type="number"
              value={editingItem.sort_order}
              onChange={(e) =>
                setEditingItem({ ...editingItem, sort_order: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={editingItem.in_stock}
              onCheckedChange={(in_stock) => setEditingItem({ ...editingItem, in_stock })}
            />
            <span className="text-xs">
              {editingItem.in_stock ? "In Stock (Available)" : "Sold Out"}
            </span>
          </div>
        </div>

        <div>
          <Label>Culinary Description & Ingredients</Label>
          <Textarea
            rows={2}
            value={editingItem.description}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            placeholder="Freshly pounded Ekiti yam served with slow-cooked goat meat, rich melon seed stew..."
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          {editingItem.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEditingItem({
                  name: "",
                  category: "Soups & Swallows",
                  description: "",
                  price: 3500,
                  in_stock: true,
                  tags: [],
                  sort_order: 1,
                })
              }
            >
              Cancel Edit
            </Button>
          )}
          <Button
            size="sm"
            disabled={save.isPending || !editingItem.name.trim()}
            onClick={() => save.mutate()}
          >
            {save.isPending
              ? "Saving…"
              : editingItem.id
                ? "Update Menu Item"
                : "Add to Restaurant Menu"}
          </Button>
        </div>
      </Card>

      {/* Menu Catalog Table */}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px]">
                    {item.category}
                  </Badge>
                  <h4 className="font-semibold text-base mt-1">{item.name}</h4>
                </div>
                <span className="font-mono font-bold text-primary text-sm">
                  {naira(item.price)}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
              <Badge variant={item.in_stock ? "default" : "secondary"} className="text-[10px]">
                {item.in_stock ? "In Stock" : "Sold Out"}
              </Badge>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => setEditingItem(item)}>
                  Edit
                </Button>
                {item.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => remove.mutate(item.id!)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   PROMOTIONAL COUPONS & VOUCHERS MANAGER
   ========================================================================= */

type CouponRecord = {
  id?: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_spend: number;
  max_uses: number;
  uses_count: number;
  valid_until: string;
  active: boolean;
};

function CouponManager() {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["cms-coupons"],
    queryFn: () => listCoupons() as Promise<CouponRecord[]>,
  });

  const [draft, setDraft] = useState<CouponRecord>({
    code: "BANKYGOLD15",
    discount_type: "percentage",
    discount_value: 15,
    min_spend: 50000,
    max_uses: 100,
    uses_count: 0,
    valid_until: "2026-12-31",
    active: true,
  });

  const save = useMutation({
    mutationFn: () => saveCoupon({ data: draft }),
    onSuccess: () => {
      toast.success("Discount coupon code registered.");
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
      setDraft({
        code: "",
        discount_type: "percentage",
        discount_value: 10,
        min_spend: 30000,
        max_uses: 50,
        uses_count: 0,
        valid_until: "2026-12-31",
        active: true,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCoupon({ data: { id } }),
    onSuccess: () => {
      toast.success("Coupon removed.");
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading coupons…</p>;

  return (
    <div className="space-y-6">
      {/* Coupon Creator */}
      <Card className="p-5 border-primary/20 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Generate Discount Voucher / Coupon</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Coupon Code</Label>
            <Input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="e.g. EKITIFEST20"
              className="font-mono uppercase font-bold"
            />
          </div>
          <div>
            <Label>Discount Type</Label>
            <select
              value={draft.discount_type}
              onChange={(e) =>
                setDraft({ ...draft, discount_type: e.target.value as "percentage" | "fixed" })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Fixed Amount Off (₦ NGN)</option>
            </select>
          </div>
          <div>
            <Label>Discount Value ({draft.discount_type === "percentage" ? "%" : "₦"})</Label>
            <Input
              type="number"
              value={draft.discount_value}
              onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Min. Booking Spend (₦)</Label>
            <Input
              type="number"
              value={draft.min_spend}
              onChange={(e) => setDraft({ ...draft, min_spend: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Max Redemptions</Label>
            <Input
              type="number"
              value={draft.max_uses}
              onChange={(e) => setDraft({ ...draft, max_uses: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Expiration Date</Label>
            <Input
              type="date"
              value={draft.valid_until}
              onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={draft.active}
              onCheckedChange={(active) => setDraft({ ...draft, active })}
            />
            <span className="text-xs">{draft.active ? "Coupon Active" : "Coupon Paused"}</span>
          </div>
          <Button
            size="sm"
            disabled={save.isPending || !draft.code.trim()}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Register Coupon"}
          </Button>
        </div>
      </Card>

      {/* Coupon List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <Card key={c.id} className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-base tracking-wider text-primary">
                  {c.code}
                </span>
                <Badge variant={c.active ? "default" : "secondary"} className="text-[10px]">
                  {c.active ? "Active" : "Disabled"}
                </Badge>
              </div>
              <div className="mt-2 text-sm font-semibold">
                {c.discount_type === "percentage"
                  ? `${c.discount_value}% Discount`
                  : `${naira(c.discount_value)} Flat Discount`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min spend: {naira(c.min_spend)} • Max uses: {c.max_uses}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted-foreground">
              <span>Expires: {c.valid_until || "Never"}</span>
              {c.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => remove.mutate(c.id!)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   GUEST REVIEWS & TESTIMONIALS MODERATOR
   ========================================================================= */

type TestimonialRecord = {
  id: string;
  guest_name: string;
  location: string;
  stay_type: string;
  rating: number;
  content: string;
  verified?: boolean;
  featured?: boolean;
  staff_response?: string;
  created_at: string;
};

function ReviewsModerator() {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["cms-reviews"],
    queryFn: () => listAdminTestimonials() as Promise<TestimonialRecord[]>,
  });

  const moderate = useMutation({
    mutationFn: (vars: { id: string; verified?: boolean; featured?: boolean }) =>
      moderateTestimonial({ data: vars }),
    onSuccess: () => {
      toast.success("Review status updated.");
      queryClient.invalidateQueries({ queryKey: ["cms-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminTestimonial({ data: { id } }),
    onSuccess: () => {
      toast.success("Review removed.");
      queryClient.invalidateQueries({ queryKey: ["cms-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading reviews…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Guest Reviews Moderation & Verification</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {reviews.length} Total Submissions
        </Badge>
      </div>

      <div className="grid gap-3">
        {reviews.map((r) => (
          <Card key={r.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{r.guest_name}</h4>
                  <span className="text-xs text-muted-foreground">({r.location})</span>
                  {r.verified && (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-500/30 text-[10px]"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified Stay
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.stay_type}</div>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < r.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">
              "{r.content}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(r.verified)}
                    onChange={(e) => moderate.mutate({ id: r.id, verified: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Verified Guest</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(r.featured)}
                    onChange={(e) => moderate.mutate({ id: r.id, featured: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Feature in Carousel</span>
                </label>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 text-xs"
                onClick={() => remove.mutate(r.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactInquiriesModerator() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: rawInquiries = [], isLoading } = useQuery({
    queryKey: ["contact-inquiries"],
    queryFn: () => listContactSubmissions(),
  });

  const inquiries = (rawInquiries as ContactSubmission[]) || [];

  const updateStatus = useMutation({
    mutationFn: (vars: { id: string; status: "unread" | "read" | "replied" | "archived" }) =>
      updateContactStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Inquiry status updated.");
      queryClient.invalidateQueries({ queryKey: ["contact-inquiries"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const removeInquiry = useMutation({
    mutationFn: (id: string) => deleteContactSubmission({ data: { id } }),
    onSuccess: () => {
      toast.success("Inquiry deleted from database.");
      queryClient.invalidateQueries({ queryKey: ["contact-inquiries"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === "all" ? true : (inq.status || "unread") === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.phone && inq.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const unreadCount = inquiries.filter((i) => (i.status || "unread") === "unread").length;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading inquiries from Firebase…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>Guest Contact & Desk Inquiries</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Messages and reservation questions submitted through the public Contact Us form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
              {unreadCount} Unread
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {inquiries.length} Total Received
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, subject, phone or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-1">
          {["all", "unread", "read", "replied", "archived"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="text-[11px] h-8 capitalize px-2.5"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {inquiries.length === 0
            ? "No contact submissions yet. Incoming messages submitted on the Contact page will appear here."
            : "No inquiries matched your current filter criteria."}
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredInquiries.map((inq) => {
            const status = inq.status || "unread";
            const dateStr = inq.created_at
              ? new Date(inq.created_at).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Recent";

            return (
              <Card
                key={inq.id}
                className={`p-4 sm:p-5 space-y-3 transition-colors ${
                  status === "unread"
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10"
                    : "bg-card"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">{inq.name}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          status === "unread"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold"
                            : status === "replied"
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                              : status === "archived"
                                ? "bg-muted text-muted-foreground"
                                : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {status}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {inq.email}
                      </span>
                      {inq.phone && (
                        <span className="flex items-center gap-1 text-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {inq.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick direct response links */}
                    <a
                      href={`mailto:${inq.email}?subject=${encodeURIComponent(
                        `Re: ${inq.subject} — Banky Hotel & Suites`,
                      )}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted"
                    >
                      <Mail className="h-3 w-3 text-primary" />
                      <span>Email Reply</span>
                    </a>

                    {inq.phone && (
                      <a
                        href={whatsappLink(
                          `Hello ${inq.name}, regarding your Banky Hotel & Suites inquiry: "${inq.subject}"...`,
                          inq.phone.replace(/[^0-9]/g, ""),
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground">
                    Subject: {inq.subject}
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed border border-border/50">
                    {inq.message}
                  </div>
                </div>

                {/* Status Management Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Mark status:</span>
                    {status !== "replied" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => updateStatus.mutate({ id: inq.id, status: "replied" })}
                      >
                        <Check className="h-3 w-3" /> Replied
                      </Button>
                    )}
                    {status === "unread" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => updateStatus.mutate({ id: inq.id, status: "read" })}
                      >
                        Read
                      </Button>
                    )}
                    {status !== "unread" && status !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 text-muted-foreground"
                        onClick={() => updateStatus.mutate({ id: inq.id, status: "archived" })}
                      >
                        <Archive className="h-3 w-3" /> Archive
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-destructive hover:bg-destructive/10 text-[11px]"
                    onClick={() => {
                      if (confirm(`Delete message from ${inq.name}?`)) {
                        removeInquiry.mutate(inq.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
