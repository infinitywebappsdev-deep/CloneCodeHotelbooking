import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { getPage, getPublicPost } from "@/lib/site.functions";
import { extractYouTubeId } from "@/lib/project-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Phone,
  Play,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { whatsappLink } from "@/lib/hotel";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    // Check both pages and posts
    const [page, post] = await Promise.all([
      getPage({ data: { slug: params.slug } }).catch(() => null),
      getPublicPost({ data: { slug: params.slug } }).catch(() => null),
    ]);

    const item = post || page;
    if (!item || item["published"] === false) throw notFound();

    return {
      type: post ? "post" : "page",
      data: item,
    };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.data;
    const title = item?.title ? `${item.title} — Banky Hotel & Suites` : "Banky Hotel & Suites";
    const description =
      item?.meta_description ||
      item?.excerpt ||
      item?.subtitle ||
      "Banky Hotel & Suites, a luxury boutique retreat in Ado-Ekiti, Ekiti State.";
    const image = item?.featured_image || "/images/hero.jpg";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
    };
  },
  errorComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="text-4xl font-serif">We could not load this content</h1>
      <p className="mt-3 text-muted-foreground">
        Please try again in a moment or explore our rooms.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return to Homepage</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="text-4xl font-serif">Page or Article Not Found</h1>
      <p className="mt-3 text-muted-foreground">
        The publication you were looking for is no longer available.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return to Homepage</Link>
      </Button>
    </div>
  ),
  component: CustomContentPage,
});

function CustomContentPage() {
  const { type, data } = Route.useLoaderData();
  const isPost = type === "post";
  const [copied, setCopied] = useState(false);

  const heroImage = data.featured_image || "/images/hero.jpg";
  const youtubeId = data.featured_video ? extractYouTubeId(data.featured_video) : null;

  function copyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Article link copied!");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner / Hero */}
      <PageHero
        eyebrow={isPost ? (data.category as string) || "Hotel News" : "Banky Hotel & Suites"}
        title={data.title as string}
        copy={(data.excerpt || data.subtitle) as string}
        image={heroImage}
      />

      {/* Main Content Container */}
      <div className="container-x py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Breadcrumbs & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span>{isPost ? "News & Articles" : "Pages"}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium truncate max-w-xs">{data.title}</span>
            </div>

            {/* Social Share & Copy */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {copied ? "Link Copied" : "Share Article"}
              </Button>
            </div>
          </div>

          {/* Article Info Header (For Posts) */}
          {isPost && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {data.category && (
                <Badge variant="default" className="text-xs">
                  {data.category as string}
                </Badge>
              )}
              {data.author_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {data.author_name as string}
                </span>
              )}
              {data.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(data.published_at as string).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {data.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {data.read_time as string}
                </span>
              )}
            </div>
          )}

          {/* Featured Video Embed (if provided) */}
          {youtubeId ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-black/5 shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0`}
                title={data.title as string}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : data.featured_video && data.featured_video.endsWith(".mp4") ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-black shadow-lg">
              <video
                src={data.featured_video as string}
                controls
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          {/* Main Formatted Article Body */}
          <article className="prose prose-lg max-w-none space-y-6 text-foreground/90 leading-relaxed">
            {String(data.body ?? "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((block, i) => {
                const trimmed = block.trim();

                // H2 / H3 Headings
                if (trimmed.startsWith("### ")) {
                  return (
                    <h2
                      key={i}
                      className="font-serif text-2xl sm:text-3xl font-semibold text-foreground pt-4 pb-1 border-b border-border/40"
                    >
                      {trimmed.replace("### ", "")}
                    </h2>
                  );
                }
                if (trimmed.startsWith("#### ")) {
                  return (
                    <h3
                      key={i}
                      className="font-serif text-xl sm:text-2xl font-semibold text-foreground pt-3"
                    >
                      {trimmed.replace("#### ", "")}
                    </h3>
                  );
                }

                // Blockquotes / Testimonial Callouts
                if (trimmed.startsWith("> ")) {
                  return (
                    <blockquote
                      key={i}
                      className="relative rounded-2xl border-l-4 border-primary bg-primary/5 p-6 font-serif italic text-foreground my-6 shadow-sm"
                    >
                      <p className="text-base sm:text-lg">{trimmed.replace(/^>\s*/, "")}</p>
                    </blockquote>
                  );
                }

                // Bullet Lists
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  const items = trimmed.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ""));
                  return (
                    <ul key={i} className="list-disc list-outside ml-6 space-y-2 my-4 text-base">
                      {items.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Numbered Lists
                if (/^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split(/\n/).map((l) => l.replace(/^\d+\.\s*/, ""));
                  return (
                    <ol key={i} className="list-decimal list-outside ml-6 space-y-2 my-4 text-base">
                      {items.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Regular Paragraph
                return (
                  <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
          </article>

          {/* Tags (for posts) */}
          {isPost && Array.isArray(data.tags) && data.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t">
              <span className="text-xs font-semibold text-muted-foreground">Topics:</span>
              {(data.tags as string[]).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Guest Call to Action Box */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-10 text-center space-y-4 shadow-sm">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
              Experience Banky Hotel &amp; Suites
            </h3>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Whether you are planning a corporate conference, a dream wedding banquet, or a
              relaxing weekend getaway in Ado-Ekiti, we look forward to hosting you.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="shadow-md">
                <Link to="/reserve">Reserve Your Suite</Link>
              </Button>
              <a
                href={whatsappLink("Hello Banky Hotel, I'm reaching out regarding your website.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                Contact Concierge on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
