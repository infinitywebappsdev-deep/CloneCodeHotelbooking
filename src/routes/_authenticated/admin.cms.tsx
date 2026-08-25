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
} from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: CmsPage,
});

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
      <TabsList>
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="faqs">FAQs</TabsTrigger>
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
    <Card className="space-y-3 p-5">
      {isNew && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Add a new image</p>
      )}
      {draft.url && (
        <img
          src={draft.url}
          alt={draft.caption || "Gallery preview"}
          className="h-40 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
      <div>
        <Label>Image URL</Label>
        <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
      </div>
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
