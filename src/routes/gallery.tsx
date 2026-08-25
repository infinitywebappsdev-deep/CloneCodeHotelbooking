import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import hotelLobby from "@/assets/Hotel Lobby.jpg";
import { MasonryGallery } from "@/components/site/MasonryGallery";
import { Sparkles, Bed, Utensils, PartyPopper, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery & Interior Design — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Explore all 33 photographs of luxury suites, hotel amenities, Ballard lounge, Restaurant 2, open-air bar garden, and Banky Hall through our interactive high-definition photo gallery.",
      },
      { property: "og:title", content: "Interactive Photo Gallery — Banky Hotel & Suites" },
      {
        property: "og:description",
        content:
          "Explore the rooms, luxury suites, gardens, bar, and hall in Ado-Ekiti with our interactive lightbox showcase.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Visual Architecture & Amenities"
        title="Photo Gallery"
        copy="A photographic tour of our suites, executive rooms, fine dining restaurant, open-air bar garden, and Banky Hall. Click any photograph to view high-definition interior details."
        image={hotelLobby}
      />

      <section className="container-x py-16">
        {/* Quick Highlights Row */}
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Bed className="h-5 w-5 text-primary mb-2" />
            <div className="font-display text-2xl sm:text-3xl text-foreground">28 Rooms</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
              Curated Suites & Rooms
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Utensils className="h-5 w-5 text-amber-500 mb-2" />
            <div className="font-display text-2xl sm:text-3xl text-foreground">Restaurant 2</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
              Fine Dining & Open Bar
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <PartyPopper className="h-5 w-5 text-emerald-600 mb-2" />
            <div className="font-display text-2xl sm:text-3xl text-foreground">300 Guests</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
              Banky Hall Ballroom
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <div className="font-display text-2xl sm:text-3xl text-foreground">24/7 Power</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
              Solar & Generator Substation
            </div>
          </div>
        </div>

        {/* Interactive Masonry Gallery with Lightbox */}
        <MasonryGallery showFilters={true} showSearch={true} showViewToggle={true} />

        {/* Direct Booking Call to Action */}
        <div className="mt-20 relative overflow-hidden rounded-3xl border border-white/20 bg-card/80 px-8 py-14 text-center shadow-xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/10 blur-3xl" />
          <span className="eyebrow text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Bespoke Hospitality in Ado-Ekiti
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl sm:text-4xl">
            Experience Banky Hotel & Suites in Person
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            From our quiet Signature Suites to the open-air bar garden and state-of-the-art Banky
            Hall, we invite you to enjoy exceptional Nigerian hospitality.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/reserve"
              id="gallery-cta-reserve-btn"
              className="rounded-full bg-primary px-8 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Reserve Your Stay
            </Link>
            <Link
              to="/contact"
              id="gallery-cta-contact-btn"
              className="rounded-full border border-border px-7 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-foreground hover:bg-muted"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
