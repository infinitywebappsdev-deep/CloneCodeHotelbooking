import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { RoomShowcase } from "@/components/site/RoomShowcase";
import { ROOMS, naira } from "@/lib/hotel";
import signatureSuiteHero from "@/assets/Signature Suite.jpg";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Wifi, Coffee } from "lucide-react";

export const Route = createFileRoute("/rooms/")({
  head: () => ({
    meta: [
      { title: "Rooms & Suites — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Explore 28 rooms and suites from ₦30,000 per night at Banky Hotel & Suites. Signature Suite, Diplomatic Suite, Executive rooms, and direct online reservation.",
      },
      { property: "og:title", content: "Rooms & Suites — Banky Hotel & Suites" },
      {
        property: "og:description",
        content:
          "Eight categories of bright, contemporary rooms and suites in Ado-Ekiti with glassmorphism design.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <>
      <PageHero
        eyebrow="Luxury Accommodation"
        title="Rooms & Suites"
        copy="Twenty-eight individually kept suites across eight categories, each featuring 4K smart entertainment, climate control, high-speed fibre Wi-Fi, and 24-hour room service."
        image={signatureSuiteHero}
      />

      <section className="container-x py-20">
        {/* Interactive Room Showcase Grid */}
        <div className="mb-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Curated Inventory
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Browse & Filter Accommodations
              </h2>
            </div>
          </div>
          <RoomShowcase showAllLink={false} />
        </div>

        {/* Detailed Room Editorial Breakdown */}
        <div className="border-t border-border pt-20">
          <div className="text-center sm:text-left mb-12">
            <span className="eyebrow text-muted-foreground">Architectural Details</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              In-Depth Suite Specifications
            </h2>
          </div>

          <div className="grid gap-16">
            {ROOMS.map((room, i) => (
              <article
                key={room.slug}
                id={`room-detail-editorial-${room.slug}`}
                className={`grid gap-10 lg:grid-cols-2 lg:items-center ${
                  i % 2 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                  <img
                    src={room.image}
                    alt={room.name}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="h-[420px] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 rounded-full border border-white/20 bg-black/60 px-4 py-1 backdrop-blur-md text-white font-display text-sm">
                    {naira(room.rate)} / night
                  </div>
                </figure>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-muted-foreground">
                      {room.size} · {room.occupancy} · {room.qty} in inventory
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
                    {room.name}
                  </h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground text-sm">{room.blurb}</p>

                  <ul className="mt-6 grid grid-cols-2 gap-2 text-xs text-foreground/80">
                    {room.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 border-t border-border/60 pt-2.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 border-t border-border/60 pt-2.5">
                      <Wifi className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Fibre Internet</span>
                    </li>
                    <li className="flex items-center gap-2 border-t border-border/60 pt-2.5">
                      <Coffee className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Breakfast Included</span>
                    </li>
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/reserve"
                      search={{ room: room.slug }}
                      id={`book-suite-direct-${room.slug}`}
                      className="rounded-full bg-primary px-7 py-3 text-xs tracking-[0.16em] uppercase text-primary-foreground transition-transform hover:opacity-95"
                    >
                      Reserve {room.name}
                    </Link>
                    <Link
                      to="/rooms/$slug"
                      params={{ slug: room.slug }}
                      className="rounded-full border border-border px-6 py-3 text-xs tracking-[0.16em] uppercase text-foreground hover:bg-muted"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
