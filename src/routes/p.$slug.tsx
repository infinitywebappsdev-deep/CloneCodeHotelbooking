import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { getPage } from "@/lib/site.functions";
import hero from "@/assets/Hotel Lobby.jpg";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const page = await getPage({ data: { slug: params.slug } });
    if (!page || page.published === false) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} — Banky Hotel & Suites`
      : "Banky Hotel & Suites";
    const description =
      loaderData?.meta_description ||
      loaderData?.subtitle ||
      "Banky Hotel & Suites, a boutique retreat in Ado-Ekiti, Ekiti State.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="text-4xl">We could not load this page</h1>
      <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you were looking for is no longer published.
      </p>
    </div>
  ),
  component: CustomPage,
});

function CustomPage() {
  const page = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Banky Hotel & Suites"
        title={page.title}
        copy={page.subtitle}
        image={hero}
      />
      <section className="container-x py-20">
        <article className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
          {String(page.body ?? "")
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </article>
      </section>
    </>
  );
}
