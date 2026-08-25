import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useId } from "react";
import {
  cmsLoad,
  savePage,
  saveFaq,
  deleteFaq,
  saveGalleryImage,
  deleteGalleryImage,
  createPage,
  deletePage,
  savePageDraft,
  publishPage,
  listPageVersions,
  rollbackPage,
  listPosts,
  savePost,
  createPost,
  deletePost,
  listMenuItems,
  saveMenuItem,
  deleteMenuItem,
  listCoupons,
  saveCoupon,
  deleteCoupon,
  listAdminTestimonials,
  moderateTestimonial,
  deleteAdminTestimonial,
  getSiteSections,
  saveSiteSection,
  DEFAULT_POST_CATEGORIES,
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
  FileText,
  Newspaper,
  Layout,
  Sparkles,
  Plus,
  Edit,
  ExternalLink,
  Eye,
  Calendar,
  User,
  History,
  RotateCcw,
  Sliders,
  FolderOpen,
  Upload,
  Video,
  Bold,
  Italic,
  List,
  Quote,
  Heading2,
  Heading3,
  Globe,
  Share2,
  Maximize2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  MediaImagePicker,
  MediaLibraryBrowser,
  type MediaItem,
} from "@/components/admin/MediaImagePicker";
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
  featured_image?: string;
  featured_video?: string;
  template?: "standard" | "hero" | "split" | "fullwidth";
  meta_description: string;
  nav_label: string;
  sort_order: number;
  published: boolean;
};

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string;
  featured_video?: string;
  category: string;
  tags?: string[];
  author_name: string;
  author_avatar?: string;
  status: "published" | "draft" | "scheduled";
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  read_time?: string;
  views_count?: number;
  sort_order?: number;
  published?: boolean;
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

  const [activeSubTab, setActiveSubTab] = useState<string>("posts");

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading WordPress-Grade CMS Dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WordPress-like Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Layout className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Website Content Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage all website pages, news articles &amp; blog posts, media library
            photography/videos, menus, and global content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            View Live Site
          </Link>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1.5 gap-1 bg-muted/70 rounded-xl border">
          <TabsTrigger value="posts" className="gap-1.5 text-xs">
            <Newspaper className="h-3.5 w-3.5 text-primary" />
            Posts &amp; News ({(data.posts as Post[])?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            Pages ({(data.pages as Page[])?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5 text-xs">
            <Images className="h-3.5 w-3.5 text-emerald-600" />
            Media Library
          </TabsTrigger>
          <TabsTrigger value="customizer" className="gap-1.5 text-xs">
            <Sliders className="h-3.5 w-3.5 text-amber-600" />
            Site Customizer
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1.5 text-xs">
            <Images className="h-3.5 w-3.5" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-1.5 text-xs">
            <Utensils className="h-3.5 w-3.5 text-orange-600" />
            F&amp;B Menu
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5 text-purple-600" />
            Vouchers
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5 text-cyan-600" />
            Inquiries
          </TabsTrigger>
        </TabsList>

        {/* TAB: POSTS & ARTICLES */}
        <TabsContent value="posts" className="space-y-4">
          <PostsManager posts={data.posts as Post[]} onSaved={refresh} />
        </TabsContent>

        {/* TAB: PAGES */}
        <TabsContent value="pages" className="space-y-4">
          <PagesManager pages={data.pages as Page[]} onSaved={refresh} />
        </TabsContent>

        {/* TAB: MEDIA LIBRARY */}
        <TabsContent value="media" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="text-base font-serif font-semibold">
                Media Library &amp; Asset Folders
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload new photography or videos from your computer, organize assets into folders,
                copy asset links, or paste YouTube links.
              </p>
            </div>
            <MediaLibraryBrowser />
          </Card>
        </TabsContent>

        {/* TAB: SITE CUSTOMIZER */}
        <TabsContent value="customizer" className="space-y-4">
          <SiteSectionsManager onSaved={refresh} />
        </TabsContent>

        {/* TAB: GALLERY */}
        <TabsContent value="gallery" className="space-y-4">
          <GalleryManager gallery={data.gallery as Image[]} onSaved={refresh} />
        </TabsContent>

        {/* TAB: F&B MENU */}
        <TabsContent value="menu" className="space-y-4">
          <MenuManager />
        </TabsContent>

        {/* TAB: FAQS */}
        <TabsContent value="faqs" className="space-y-4">
          <FaqsManager faqs={data.faqs as Faq[]} onSaved={refresh} />
        </TabsContent>

        {/* TAB: COUPONS */}
        <TabsContent value="coupons" className="space-y-4">
          <CouponManager />
        </TabsContent>

        {/* TAB: REVIEWS */}
        <TabsContent value="reviews" className="space-y-4">
          <ReviewsModerator />
        </TabsContent>

        {/* TAB: INQUIRIES */}
        <TabsContent value="inquiries" className="space-y-4">
          <ContactInquiriesModerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================================================================
   1. POSTS & ARTICLES MANAGER (WordPress Posts)
   ========================================================================= */

function PostsManager({ posts, onSaved }: { posts: Post[]; onSaved: () => void }) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredPosts = (posts || []).filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && (p.status === "published" || p.published !== false)) ||
      (statusFilter === "draft" && (p.status === "draft" || p.published === false));
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isCreatingNew || editingPost) {
    return (
      <PostEditor
        post={
          editingPost || {
            id: "",
            slug: "",
            title: "",
            excerpt: "",
            body: "",
            featured_image: "/images/BankyHall.jpg",
            category: "Hotel News",
            tags: ["news", "hotel"],
            author_name: "Banky Hotel Editorial",
            status: "published",
            published_at: new Date().toISOString(),
            meta_title: "",
            meta_description: "",
            read_time: "3 min read",
            published: true,
          }
        }
        isNew={isCreatingNew}
        onSaved={() => {
          setIsCreatingNew(false);
          setEditingPost(null);
          onSaved();
        }}
        onCancel={() => {
          setIsCreatingNew(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingNew(true)} className="gap-1.5 text-xs shadow">
            <Plus className="h-4 w-4" />
            Add New Post
          </Button>
          <span className="text-xs text-muted-foreground">
            Total {filteredPosts.length} article(s)
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs w-44 sm:w-56"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="all">All Categories</option>
            {DEFAULT_POST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as never)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
          <p className="text-sm font-medium">No posts found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create an announcement, news update, or event promotion article.
          </p>
          <Button size="sm" onClick={() => setIsCreatingNew(true)} className="mt-4 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Write First Post
          </Button>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Post Title</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Author</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPosts.map((post) => (
                <tr key={post.id || post.slug} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={post.featured_image || "/images/BankyHall.jpg"}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-foreground truncate max-w-sm"
                          title={post.title}
                        >
                          {post.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          /p/{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">
                      {post.category || "Hotel News"}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{post.author_name || "Editorial"}</td>
                  <td className="p-3">
                    {post.status === "published" || post.published !== false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        <Check className="h-3 w-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "Recent"}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => setEditingPost(post)}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Link
                      to={`/p/${post.slug}`}
                      target="_blank"
                      className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2 text-xs hover:bg-accent hover:text-accent-foreground"
                      title="View Live Article"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PostEditor({
  post,
  isNew,
  onSaved,
  onCancel,
}: {
  post: Post;
  isNew: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(post);
  const [previewMode, setPreviewMode] = useState<"edit" | "split" | "preview">("edit");
  const [tagInput, setTagInput] = useState("");

  const saveMut = useMutation({
    mutationFn: () => {
      const dataToSave = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt || "",
        body: draft.body || "",
        featured_image: draft.featured_image || "",
        featured_video: draft.featured_video || "",
        category: draft.category || "Hotel News",
        tags: draft.tags || [],
        author_name: draft.author_name || "Banky Hotel Editorial",
        author_avatar: draft.author_avatar || "",
        status: draft.status || "published",
        published_at: draft.published_at || new Date().toISOString(),
        meta_title: draft.meta_title || draft.title,
        meta_description: draft.meta_description || draft.excerpt || "",
        read_time: draft.read_time || "3 min read",
        sort_order: Number(draft.sort_order ?? 0),
        published: draft.status === "published",
      };

      if (isNew || !draft.id) {
        return createPost({ data: dataToSave });
      } else {
        return savePost({ data: { id: draft.id, ...dataToSave } });
      }
    },
    onSuccess: () => {
      toast.success(isNew ? "Post published successfully!" : "Post updated successfully!");
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: () => deletePost({ data: { id: draft.id } }),
    onSuccess: () => {
      toast.success("Post deleted.");
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  function insertFormatting(prefix: string, suffix = "") {
    const textarea = document.getElementById("post-body-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.body.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const newBody = draft.body.substring(0, start) + replacement + draft.body.substring(end);
    setDraft({ ...draft, body: newBody });
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
            ← Back to Posts
          </Button>
          <span className="text-sm font-semibold font-serif">
            {isNew ? "Write New Post" : `Editing: ${draft.title}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/70 p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setPreviewMode("edit")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                previewMode === "edit"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("split")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                previewMode === "split"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                previewMode === "preview"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Live Preview
            </button>
          </div>

          {!isNew && draft.id && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              onClick={() => {
                if (confirm(`Delete post "${draft.title}"?`)) {
                  deleteMut.mutate();
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !draft.title.trim() || !draft.slug.trim()}
            className="gap-1.5 text-xs shadow-md"
          >
            <Check className="h-4 w-4" />
            {saveMut.isPending
              ? "Saving…"
              : draft.status === "published"
                ? "Publish Post"
                : "Save Draft"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Content Column + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Center Content Column */}
        <div
          className={
            previewMode === "preview"
              ? "lg:col-span-12"
              : previewMode === "split"
                ? "lg:col-span-8 space-y-4"
                : "lg:col-span-8 space-y-4"
          }
        >
          {previewMode !== "preview" && (
            <Card className="p-5 space-y-4">
              {/* Title & Slug */}
              <div>
                <Label className="text-xs font-semibold">Post Title</Label>
                <Input
                  placeholder="Enter a compelling headline (e.g. Banky Hall 2026 Wedding Specials)…"
                  value={draft.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = isNew
                      ? newTitle
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      : draft.slug;
                    setDraft({ ...draft, title: newTitle, slug: autoSlug });
                  }}
                  className="font-serif text-lg font-medium"
                />
              </div>

              {/* Slug / Permalinks */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-mono">Permalink: /p/</span>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  className="h-7 text-xs font-mono max-w-sm"
                  placeholder="post-slug-url"
                />
              </div>

              {/* Excerpt / Subtitle */}
              <div>
                <Label className="text-xs font-semibold">Post Excerpt / Summary</Label>
                <Textarea
                  rows={2}
                  placeholder="A short, engaging teaser for social feeds and cards…"
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Rich Body Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Article Content (Markdown &amp; Rich Media)
                  </Label>
                </div>

                <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/60 p-1.5 text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => insertFormatting("### ")}
                    title="Heading 2"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => insertFormatting("#### ")}
                    title="Heading 3"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 font-bold"
                    onClick={() => insertFormatting("**", "**")}
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 italic"
                    onClick={() => insertFormatting("*", "*")}
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => insertFormatting("* ")}
                    title="Bullet list"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => insertFormatting("> ")}
                    title="Quote callout"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => insertFormatting("\n---\n")}
                    title="Horizontal divider"
                  >
                    Divider
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary font-medium"
                    onClick={() => insertFormatting("[Reserve Now](/reserve)")}
                    title="Call to action button link"
                  >
                    + Button Link
                  </Button>
                </div>

                <Textarea
                  id="post-body-textarea"
                  rows={14}
                  placeholder="Write your article here using Markdown formatting. Embed images, list hotel amenities, or add testimonials…"
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className="rounded-t-none font-mono text-xs leading-relaxed"
                />
              </div>
            </Card>
          )}

          {/* Split / Live Preview Pane */}
          {(previewMode === "split" || previewMode === "preview") && (
            <Card className="p-6 space-y-4 bg-background border border-primary/20">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Article Preview
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  /p/{draft.slug || "slug"}
                </span>
              </div>

              {/* Cover */}
              {draft.featured_image && (
                <div className="aspect-video max-h-72 w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={draft.featured_image}
                    alt={draft.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {draft.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    • {draft.read_time || "3 min read"}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                  {draft.title || "Untitled Article"}
                </h1>
                {draft.excerpt && (
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {draft.excerpt}
                  </p>
                )}
              </div>

              {/* Body rendering */}
              <div className="prose prose-sm max-w-none space-y-3 pt-2 text-sm text-foreground/90 leading-relaxed">
                {draft.body
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => {
                    if (para.startsWith("### ")) {
                      return (
                        <h3
                          key={i}
                          className="font-serif text-lg font-semibold mt-4 text-foreground"
                        >
                          {para.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (para.startsWith("#### ")) {
                      return (
                        <h4
                          key={i}
                          className="font-serif text-base font-semibold mt-3 text-foreground"
                        >
                          {para.replace("#### ", "")}
                        </h4>
                      );
                    }
                    if (para.startsWith("> ")) {
                      return (
                        <blockquote
                          key={i}
                          className="border-l-2 border-primary pl-4 italic text-muted-foreground my-3"
                        >
                          {para.replace("> ", "")}
                        </blockquote>
                      );
                    }
                    if (para.startsWith("* ") || para.startsWith("- ")) {
                      const items = para.split(/\n/).map((line) => line.replace(/^[-*]\s+/, ""));
                      return (
                        <ul key={i} className="list-disc list-inside space-y-1 my-2">
                          {items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={i}>{para}</p>;
                  })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar (Settings, Media, Category, SEO) */}
        {previewMode !== "preview" && (
          <div className="lg:col-span-4 space-y-4">
            {/* Publishing Box */}
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Publishing &amp; Status
              </h3>

              <div>
                <Label className="text-xs">Post Status</Label>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as "published" | "draft" })
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                >
                  <option value="published">🟢 Published (Live for Guests)</option>
                  <option value="draft">⚪ Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  {DEFAULT_POST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Author Name</Label>
                <Input
                  value={draft.author_name}
                  onChange={(e) => setDraft({ ...draft, author_name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Estimated Reading Time</Label>
                <Input
                  value={draft.read_time}
                  onChange={(e) => setDraft({ ...draft, read_time: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="e.g. 4 min read"
                />
              </div>
            </Card>

            {/* Featured Media Picker */}
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured Cover Image &amp; Video
              </h3>
              <MediaImagePicker
                value={draft.featured_image}
                onChange={(url) => setDraft({ ...draft, featured_image: url })}
                label="Featured Cover Media"
                description="Pick from hotel photography, upload from PC, or paste video."
              />
            </Card>

            {/* Tags */}
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags &amp; Keywords
              </h3>
              <div className="flex flex-wrap gap-1">
                {(draft.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, tags: draft.tags?.filter((_, i) => i !== idx) })
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag and press enter…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      e.preventDefault();
                      const clean = tagInput
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "");
                      if (!draft.tags?.includes(clean)) {
                        setDraft({ ...draft, tags: [...(draft.tags || []), clean] });
                      }
                      setTagInput("");
                    }
                  }}
                  className="h-8 text-xs"
                />
              </div>
            </Card>

            {/* SEO Settings */}
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search Engine Optimization (SEO)
              </h3>
              <div>
                <Label className="text-xs">Meta Title</Label>
                <Input
                  value={draft.meta_title || ""}
                  onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })}
                  placeholder={draft.title || "Title tag…"}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  rows={2}
                  value={draft.meta_description || ""}
                  onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
                  placeholder="Summary snippet displayed in Google search results…"
                  className="text-xs"
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   2. PAGES MANAGER (WordPress Pages)
   ========================================================================= */

function PagesManager({ pages, onSaved }: { pages: Page[]; onSaved: () => void }) {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (isCreatingNew || editingPage) {
    return (
      <PageFullEditor
        page={
          editingPage || {
            id: "",
            slug: "",
            title: "",
            subtitle: "",
            body: "",
            featured_image: "/images/hero.jpg",
            template: "standard",
            meta_description: "",
            nav_label: "",
            sort_order: 10,
            published: true,
          }
        }
        isNew={isCreatingNew}
        onSaved={() => {
          setIsCreatingNew(false);
          setEditingPage(null);
          onSaved();
        }}
        onCancel={() => {
          setIsCreatingNew(false);
          setEditingPage(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={() => setIsCreatingNew(true)} className="gap-1.5 text-xs shadow">
          <Plus className="h-4 w-4" />
          Create New Page
        </Button>
        <span className="text-xs text-muted-foreground">Total {pages.length} custom page(s)</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Page Title</th>
              <th className="p-3 font-medium">Web Address</th>
              <th className="p-3 font-medium">Menu Label</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pages.map((page) => (
              <tr key={page.id || page.slug} className="hover:bg-muted/40 transition-colors">
                <td className="p-3 font-medium text-foreground">{page.title}</td>
                <td className="p-3 font-mono text-muted-foreground">/p/{page.slug}</td>
                <td className="p-3">
                  {page.nav_label ? (
                    <Badge variant="outline" className="text-[10px]">
                      {page.nav_label}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-[10px]">Hidden from menu</span>
                  )}
                </td>
                <td className="p-3">
                  {page.published !== false ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      <Check className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Draft
                    </span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{page.sort_order ?? 0}</td>
                <td className="p-3 text-right space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => setEditingPage(page)}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Link
                    to={`/p/${page.slug}`}
                    target="_blank"
                    className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2 text-xs hover:bg-accent hover:text-accent-foreground"
                    title="View Live Page"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageFullEditor({
  page,
  isNew,
  onSaved,
  onCancel,
}: {
  page: Page;
  isNew: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(page);
  const [showVersions, setShowVersions] = useState(false);

  const { data: versions = [] } = useQuery({
    queryKey: ["page-versions", draft.id],
    queryFn: () =>
      draft.id ? listPageVersions({ data: { pageId: draft.id } }) : Promise.resolve([]),
    enabled: !!draft.id,
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const dataToSave = {
        title: draft.title,
        subtitle: draft.subtitle || "",
        body: draft.body || "",
        featured_image: draft.featured_image || "",
        featured_video: draft.featured_video || "",
        template: draft.template || "standard",
        meta_description: draft.meta_description || "",
        nav_label: draft.nav_label || "",
        sort_order: Number(draft.sort_order ?? 0),
        published: draft.published ?? true,
      };

      if (isNew || !draft.id) {
        return createPage({ data: { slug: draft.slug, ...dataToSave } });
      } else {
        return savePage({ data: { id: draft.id, ...dataToSave } });
      }
    },
    onSuccess: () => {
      toast.success(isNew ? "Page created and published!" : "Page published.");
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: () => deletePage({ data: { id: draft.id } }),
    onSuccess: () => {
      toast.success("Page removed.");
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
            ← Back to Pages
          </Button>
          <span className="text-sm font-semibold font-serif">
            {isNew ? "New Page" : `Editing: ${draft.title}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && draft.id && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
                className="gap-1 text-xs"
              >
                <History className="h-3.5 w-3.5" />
                History ({versions.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  if (confirm(`Delete page /p/${draft.slug}?`)) {
                    deleteMut.mutate();
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          <Button
            size="sm"
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !draft.title.trim() || !draft.slug.trim()}
            className="gap-1.5 text-xs shadow-md"
          >
            <Check className="h-4 w-4" />
            {saveMut.isPending ? "Publishing…" : "Publish Page"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold">Page Title</Label>
              <Input
                placeholder="e.g. Wellness Spa &amp; Pool, Executive Conference Packages…"
                value={draft.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const autoSlug = isNew
                    ? newTitle
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    : draft.slug;
                  setDraft({ ...draft, title: newTitle, slug: autoSlug });
                }}
                className="font-serif text-lg"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-mono">Web Route: /p/</span>
              <Input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                className="h-7 text-xs font-mono max-w-sm"
                placeholder="page-slug"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Subtitle / Hero Banner Copy</Label>
              <Input
                placeholder="Introductory subtitle displayed on top hero…"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Page Body Content</Label>
              <Textarea
                rows={12}
                placeholder="Enter rich paragraph content, amenities breakdown, policies, or hospitality descriptions…"
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="font-mono text-xs leading-relaxed"
              />
            </div>
          </Card>

          {/* Live Preview Card */}
          <Card className="p-6 bg-background border border-primary/20 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Preview
              </span>
              <span className="text-xs text-muted-foreground font-mono">/p/{draft.slug}</span>
            </div>
            <h2 className="font-serif text-2xl">{draft.title || "Page Title"}</h2>
            <p className="text-xs text-muted-foreground">{draft.subtitle}</p>
            <div className="space-y-2 text-xs leading-relaxed">
              {draft.body
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Page Settings
            </h3>

            <div className="flex items-center justify-between pt-1">
              <Label className="text-xs">Publish Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={draft.published ?? true}
                  onCheckedChange={(published) => setDraft({ ...draft, published })}
                />
                <span className="text-xs">{(draft.published ?? true) ? "Live" : "Draft"}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Menu Navigation Label</Label>
              <Input
                placeholder="Leave blank to hide from menu"
                value={draft.nav_label || ""}
                onChange={(e) => setDraft({ ...draft, nav_label: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Menu Sort Order</Label>
              <Input
                type="number"
                value={draft.sort_order ?? 0}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
          </Card>

          {/* Featured Media */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hero Banner Media
            </h3>
            <MediaImagePicker
              value={draft.featured_image || ""}
              onChange={(url) => setDraft({ ...draft, featured_image: url })}
              label="Page Hero Image / Video"
            />
          </Card>

          {/* SEO */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO Meta Description
            </h3>
            <Textarea
              rows={3}
              value={draft.meta_description || ""}
              onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
              placeholder="Search engine snippet…"
              className="text-xs"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. SITE CUSTOMIZER & GLOBAL SECTIONS (WordPress Customizer)
   ========================================================================= */

function SiteSectionsManager({ onSaved }: { onSaved: () => void }) {
  const queryClient = useQueryClient();
  const { data: sections, isLoading } = useQuery({
    queryKey: ["site-sections"],
    queryFn: () => getSiteSections(),
  });

  const [heroDraft, setHeroDraft] = useState<Record<string, unknown>>({});
  const [tickerDraft, setTickerDraft] = useState<string[]>([]);
  const [storyDraft, setStoryDraft] = useState<Record<string, unknown>>({});
  const [initialized, setInitialized] = useState(false);

  if (sections && !initialized) {
    setHeroDraft((sections["hero"] as Record<string, unknown>) || {});
    setTickerDraft(
      ((sections["ticker"] as Record<string, unknown>)?.["messages"] as string[]) || [],
    );
    setStoryDraft((sections["about_story"] as Record<string, unknown>) || {});
    setInitialized(true);
  }

  const saveHeroMut = useMutation({
    mutationFn: () => saveSiteSection({ data: { section_id: "hero", data: heroDraft } }),
    onSuccess: () => {
      toast.success("Homepage Hero updated!");
      queryClient.invalidateQueries({ queryKey: ["site-sections"] });
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const saveTickerMut = useMutation({
    mutationFn: () =>
      saveSiteSection({ data: { section_id: "ticker", data: { messages: tickerDraft } } }),
    onSuccess: () => {
      toast.success("Header announcement ticker saved!");
      queryClient.invalidateQueries({ queryKey: ["site-sections"] });
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const saveStoryMut = useMutation({
    mutationFn: () => saveSiteSection({ data: { section_id: "about_story", data: storyDraft } }),
    onSuccess: () => {
      toast.success("About story & hotel highlights saved!");
      queryClient.invalidateQueries({ queryKey: ["site-sections"] });
      onSaved();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (isLoading || !sections) {
    return <p className="text-xs text-muted-foreground">Loading site customizer…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section Customizer */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-serif text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Homepage Hero &amp; Banner
            </h3>
            <p className="text-xs text-muted-foreground">
              Customize the prominent top headline, background video/photography, and primary
              reserve buttons.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => saveHeroMut.mutate()}
            disabled={saveHeroMut.isPending}
            className="text-xs"
          >
            {saveHeroMut.isPending ? "Saving…" : "Save Hero"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Hero Eyebrow</Label>
            <Input
              value={(heroDraft["eyebrow"] as string) || ""}
              onChange={(e) => setHeroDraft({ ...heroDraft, eyebrow: e.target.value })}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Main Headline</Label>
            <Input
              value={(heroDraft["headline"] as string) || ""}
              onChange={(e) => setHeroDraft({ ...heroDraft, headline: e.target.value })}
              className="text-xs font-serif"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Hero Subtitle / Tagline</Label>
          <Textarea
            rows={2}
            value={(heroDraft["tagline"] as string) || ""}
            onChange={(e) => setHeroDraft({ ...heroDraft, tagline: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Primary CTA Button Label &amp; Link</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                placeholder="Button text"
                value={(heroDraft["primary_cta_label"] as string) || ""}
                onChange={(e) => setHeroDraft({ ...heroDraft, primary_cta_label: e.target.value })}
                className="text-xs"
              />
              <Input
                placeholder="/reserve"
                value={(heroDraft["primary_cta_link"] as string) || ""}
                onChange={(e) => setHeroDraft({ ...heroDraft, primary_cta_link: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Secondary Button Label &amp; Link</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                placeholder="Button text"
                value={(heroDraft["secondary_cta_label"] as string) || ""}
                onChange={(e) =>
                  setHeroDraft({ ...heroDraft, secondary_cta_label: e.target.value })
                }
                className="text-xs"
              />
              <Input
                placeholder="/rooms"
                value={(heroDraft["secondary_cta_link"] as string) || ""}
                onChange={(e) => setHeroDraft({ ...heroDraft, secondary_cta_link: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <MediaImagePicker
          value={(heroDraft["background_image"] as string) || ""}
          onChange={(url) => setHeroDraft({ ...heroDraft, background_image: url })}
          label="Hero Background Media (High-Res Image or Video)"
        />
      </Card>

      {/* Announcement Ticker Customizer */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-serif text-base font-semibold">Header Announcement Ticker</h3>
            <p className="text-xs text-muted-foreground">
              These announcement messages scroll smoothly in the top banner bar across all guest
              pages.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => saveTickerMut.mutate()}
            disabled={saveTickerMut.isPending}
            className="text-xs"
          >
            {saveTickerMut.isPending ? "Saving…" : "Save Announcements"}
          </Button>
        </div>

        <div className="space-y-2">
          {tickerDraft.map((msg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={msg}
                onChange={(e) => {
                  const updated = [...tickerDraft];
                  updated[idx] = e.target.value;
                  setTickerDraft(updated);
                }}
                className="text-xs"
              />
              <button
                type="button"
                onClick={() => setTickerDraft(tickerDraft.filter((_, i) => i !== idx))}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTickerDraft([...tickerDraft, "New seasonal promotion message…"])}
            className="text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Announcement Line
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   4. GALLERY MANAGER
   ========================================================================= */

function GalleryManager({ gallery, onSaved }: { gallery: Image[]; onSaved: () => void }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsAdding(true)} className="gap-1.5 text-xs shadow">
          <Plus className="h-4 w-4" />
          Add Gallery Photo
        </Button>
        <span className="text-xs text-muted-foreground">{gallery.length} photos in gallery</span>
      </div>

      {isAdding && (
        <ImageEditor
          image={{
            id: "",
            url: "",
            caption: "",
            category: "hotel",
            sort_order: 99,
            published: true,
          }}
          onSaved={() => {
            setIsAdding(false);
            onSaved();
          }}
          isNew
          onCancel={() => setIsAdding(false)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((image) => (
          <ImageEditor key={image.id} image={image} onSaved={onSaved} />
        ))}
      </div>
    </div>
  );
}

function ImageEditor({
  image,
  onSaved,
  isNew,
  onCancel,
}: {
  image: Image;
  onSaved: () => void;
  isNew?: boolean;
  onCancel?: () => void;
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
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="space-y-3 p-4">
      <MediaImagePicker
        value={draft.url}
        onChange={(url) => setDraft({ ...draft, url })}
        label="Photo Asset"
        compact
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Caption</Label>
          <Input
            value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Input
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
          <span className="text-xs">{draft.published ? "Visible" : "Hidden"}</span>
        </div>

        <div className="flex gap-2">
          {!isNew && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={async () => {
                await deleteGalleryImage({ data: { id: draft.id } });
                toast.success("Photo removed.");
                onSaved();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            disabled={save.isPending || !draft.url}
            onClick={() => save.mutate()}
            className="h-7 text-xs"
          >
            {isNew ? "Add" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   5. FAQS MANAGER
   ========================================================================= */

function FaqsManager({ faqs, onSaved }: { faqs: Faq[]; onSaved: () => void }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsAdding(true)} className="gap-1.5 text-xs shadow">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
        <span className="text-xs text-muted-foreground">{faqs.length} FAQ item(s)</span>
      </div>

      {isAdding && (
        <FaqEditor
          faq={{ id: "", question: "", answer: "", sort_order: 99, published: true }}
          onSaved={() => {
            setIsAdding(false);
            onSaved();
          }}
          isNew
          onCancel={() => setIsAdding(false)}
        />
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <FaqEditor key={faq.id} faq={faq} onSaved={onSaved} />
        ))}
      </div>
    </div>
  );
}

function FaqEditor({
  faq,
  onSaved,
  isNew,
  onCancel,
}: {
  faq: Faq;
  onSaved: () => void;
  isNew?: boolean;
  onCancel?: () => void;
}) {
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
      toast.success("FAQ saved.");
      onSaved();
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <Card className="space-y-3 p-4">
      <div>
        <Label className="text-xs font-semibold">Question</Label>
        <Input
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          className="text-xs"
        />
      </div>
      <div>
        <Label className="text-xs font-semibold">Answer</Label>
        <Textarea
          rows={3}
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
          className="text-xs"
        />
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.published}
            onCheckedChange={(published) => setDraft({ ...draft, published })}
          />
          <span className="text-xs">{draft.published ? "Published" : "Hidden"}</span>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={async () => {
                await deleteFaq({ data: { id: draft.id } });
                toast.success("FAQ removed.");
                onSaved();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            disabled={save.isPending}
            onClick={() => save.mutate()}
            className="h-7 text-xs"
          >
            {isNew ? "Add FAQ" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   6. F&B MENU MANAGER
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
  "Breakfast Specials",
  "Native & African Soups",
  "Chef Grills & Asun",
  "Continental Dishes",
  "Desserts & Small Chops",
  "Signature Cocktails & Spirits",
  "Wines & Champagnes",
  "Non-Alcoholic & Juices",
];

function MenuManager() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MenuItemRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["cms-menu-items"],
    queryFn: () => listMenuItems(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: MenuItemRecord) =>
      saveMenuItem({
        data: {
          ...(data.id ? { id: data.id } : {}),
          name: data.name,
          category: data.category,
          description: data.description || "",
          price: Number(data.price),
          in_stock: Boolean(data.in_stock),
          tags: data.tags || [],
          sort_order: Number(data.sort_order || 0),
        },
      }),
    onSuccess: () => {
      toast.success("Menu item saved.");
      setEditingItem(null);
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["cms-menu-items"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem({ data: { id } }),
    onSuccess: () => {
      toast.success("Menu item deleted.");
      queryClient.invalidateQueries({ queryKey: ["cms-menu-items"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const filtered = (menuItems as MenuItemRecord[]).filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => setIsCreating(true)} className="gap-1.5 text-xs shadow">
          <Plus className="h-4 w-4" />
          Add Dish / Beverage
        </Button>
        <Input
          placeholder="Search dishes or cocktails…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-60 text-xs"
        />
      </div>

      {(isCreating || editingItem) && (
        <Card className="p-5 border-primary/40 bg-primary/5 space-y-4">
          <h3 className="font-serif text-base font-semibold">
            {isCreating ? "Add New Menu Item" : `Editing: ${editingItem?.name}`}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Item Name</Label>
              <Input
                value={editingItem?.name || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...(prev || {
                      name: "",
                      category: "Breakfast Specials",
                      description: "",
                      price: 0,
                      in_stock: true,
                      tags: [],
                      sort_order: 0,
                    }),
                    name: e.target.value,
                  }))
                }
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <select
                value={editingItem?.category || MENU_CATEGORIES[0]}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...(prev || {
                      name: "",
                      category: e.target.value,
                      description: "",
                      price: 0,
                      in_stock: true,
                      tags: [],
                      sort_order: 0,
                    }),
                    category: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Price (₦ Naira)</Label>
              <Input
                type="number"
                value={editingItem?.price || 0}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...(prev || {
                      name: "",
                      category: "Breakfast Specials",
                      description: "",
                      price: 0,
                      in_stock: true,
                      tags: [],
                      sort_order: 0,
                    }),
                    price: Number(e.target.value),
                  }))
                }
                className="text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={editingItem?.in_stock ?? true}
                onCheckedChange={(checked) =>
                  setEditingItem((prev) => ({
                    ...(prev || {
                      name: "",
                      category: "Breakfast Specials",
                      description: "",
                      price: 0,
                      in_stock: true,
                      tags: [],
                      sort_order: 0,
                    }),
                    in_stock: checked,
                  }))
                }
              />
              <span className="text-xs font-medium">
                {(editingItem?.in_stock ?? true) ? "In Stock (Available)" : "Sold Out"}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs">Description &amp; Ingredients</Label>
            <Textarea
              rows={2}
              value={editingItem?.description || ""}
              onChange={(e) =>
                setEditingItem((prev) => ({
                  ...(prev || {
                    name: "",
                    category: "Breakfast Specials",
                    description: "",
                    price: 0,
                    in_stock: true,
                    tags: [],
                    sort_order: 0,
                  }),
                  description: e.target.value,
                }))
              }
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!editingItem?.name || saveMutation.isPending}
              onClick={() => editingItem && saveMutation.mutate(editingItem)}
              className="text-xs"
            >
              {saveMutation.isPending ? "Saving…" : "Save Item"}
            </Button>
          </div>
        </Card>
      )}

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id || item.name} className="p-4 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif text-sm font-semibold">{item.name}</h4>
                <span className="font-mono text-xs font-semibold text-primary">
                  {naira(item.price)}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] my-1">
                {item.category}
              </Badge>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span
                className={`text-[10px] font-medium ${
                  item.in_stock ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {item.in_stock ? "Available" : "Sold out"}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[11px]"
                  onClick={() => setEditingItem(item)}
                >
                  Edit
                </Button>
                {item.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(item.id!);
                    }}
                  >
                    Delete
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
   7. COUPONS & PROMO VOUCHERS MANAGER
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
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: coupons = [] } = useQuery({
    queryKey: ["cms-coupons"],
    queryFn: () => listCoupons(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: CouponRecord) =>
      saveCoupon({
        data: {
          ...(data.id ? { id: data.id } : {}),
          code: data.code,
          discount_type: data.discount_type,
          discount_value: Number(data.discount_value),
          min_spend: Number(data.min_spend || 0),
          max_uses: Number(data.max_uses || 100),
          uses_count: Number(data.uses_count || 0),
          valid_until: data.valid_until || "",
          active: Boolean(data.active),
        },
      }),
    onSuccess: () => {
      toast.success("Coupon saved.");
      setEditingCoupon(null);
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon({ data: { id } }),
    onSuccess: () => {
      toast.success("Coupon removed.");
      queryClient.invalidateQueries({ queryKey: ["cms-coupons"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsCreating(true)} className="gap-1.5 text-xs shadow">
          <Plus className="h-4 w-4" />
          Create Promo Voucher
        </Button>
      </div>

      {(isCreating || editingCoupon) && (
        <Card className="p-4 space-y-3 border-primary/40 bg-primary/5">
          <h4 className="font-serif text-sm font-semibold">
            {isCreating ? "New Voucher Code" : `Edit Voucher: ${editingCoupon?.code}`}
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Coupon Code</Label>
              <Input
                placeholder="e.g. BANKY2026"
                value={editingCoupon?.code || ""}
                onChange={(e) =>
                  setEditingCoupon((prev) => ({
                    ...(prev || {
                      code: "",
                      discount_type: "percentage",
                      discount_value: 10,
                      min_spend: 0,
                      max_uses: 50,
                      uses_count: 0,
                      valid_until: "",
                      active: true,
                    }),
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="text-xs font-mono font-bold"
              />
            </div>
            <div>
              <Label className="text-xs">Discount Type</Label>
              <select
                value={editingCoupon?.discount_type || "percentage"}
                onChange={(e) =>
                  setEditingCoupon((prev) => ({
                    ...(prev || {
                      code: "",
                      discount_type: "percentage",
                      discount_value: 10,
                      min_spend: 0,
                      max_uses: 50,
                      uses_count: 0,
                      valid_until: "",
                      active: true,
                    }),
                    discount_type: e.target.value as "percentage" | "fixed",
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="percentage">Percentage (%) Off</option>
                <option value="fixed">Fixed Amount (₦) Off</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Discount Amount</Label>
              <Input
                type="number"
                value={editingCoupon?.discount_value || 0}
                onChange={(e) =>
                  setEditingCoupon((prev) => ({
                    ...(prev || {
                      code: "",
                      discount_type: "percentage",
                      discount_value: 10,
                      min_spend: 0,
                      max_uses: 50,
                      uses_count: 0,
                      valid_until: "",
                      active: true,
                    }),
                    discount_value: Number(e.target.value),
                  }))
                }
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingCoupon(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!editingCoupon?.code || saveMutation.isPending}
              onClick={() => editingCoupon && saveMutation.mutate(editingCoupon)}
              className="text-xs"
            >
              Save Voucher
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {(coupons as CouponRecord[]).map((c) => (
          <Card key={c.id || c.code} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-primary">{c.code}</span>
              <Badge variant={c.active ? "default" : "outline"} className="text-[10px]">
                {c.active ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {c.discount_type === "percentage"
                ? `${c.discount_value}% Discount`
                : `${naira(c.discount_value)} Flat Discount`}
            </p>
            <div className="flex justify-end gap-1 pt-2 border-t text-xs">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[11px]"
                onClick={() => setEditingCoupon(c)}
              >
                Edit
              </Button>
              {c.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px] text-destructive"
                  onClick={() => deleteMutation.mutate(c.id!)}
                >
                  Delete
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
   8. REVIEWS MODERATOR
   ========================================================================= */

function ReviewsModerator() {
  const queryClient = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["cms-reviews"],
    queryFn: () => listAdminTestimonials(),
  });

  const moderateMut = useMutation({
    mutationFn: (args: { id: string; verified?: boolean; featured?: boolean }) =>
      moderateTestimonial({ data: args }),
    onSuccess: () => {
      toast.success("Review updated.");
      queryClient.invalidateQueries({ queryKey: ["cms-reviews"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAdminTestimonial({ data: { id } }),
    onSuccess: () => {
      toast.success("Review removed.");
      queryClient.invalidateQueries({ queryKey: ["cms-reviews"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-sm font-semibold">Guest Reviews &amp; Testimonials</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {(reviews as Array<Record<string, unknown>>).map((r) => (
          <Card key={r["id"] as string} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-foreground">
                {r["guest_name"] as string}
              </span>
              <div className="flex text-amber-500">
                {Array.from({ length: Number(r["rating"] || 5) }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">"{r["comment"] as string}"</p>
            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(r["featured"])}
                  onCheckedChange={(featured) =>
                    moderateMut.mutate({ id: r["id"] as string, featured })
                  }
                />
                <span className="text-[10px]">Featured on Home</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[11px] text-destructive"
                onClick={() => deleteMut.mutate(r["id"] as string)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   9. INQUIRIES MODERATOR
   ========================================================================= */

function ContactInquiriesModerator() {
  const queryClient = useQueryClient();
  const { data: contacts = [] } = useQuery({
    queryKey: ["cms-contacts"],
    queryFn: () => listContactSubmissions(),
  });

  const updateStatusMut = useMutation({
    mutationFn: (args: { id: string; status: "new" | "read" | "replied" | "archived" }) =>
      updateContactStatus({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-contacts"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-sm font-semibold">Guest Messages &amp; Event Inquiries</h3>
      <div className="space-y-2">
        {(contacts as ContactSubmission[]).map((c) => (
          <Card key={c.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({c.email} • {c.phone})
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-foreground/80 bg-muted/30 p-2.5 rounded-lg">{c.message}</p>
            <div className="flex justify-end gap-2 pt-1 text-xs">
              <a
                href={`mailto:${c.email}`}
                className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] text-primary-foreground font-medium"
              >
                <Mail className="h-3 w-3" />
                Reply by Email
              </a>
              {c.phone && (
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-6 items-center gap-1 rounded bg-emerald-600 px-2 text-[10px] text-white font-medium"
                >
                  <Phone className="h-3 w-3" />
                  WhatsApp
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
