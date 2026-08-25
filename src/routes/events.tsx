import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import bankyHall from "@/assets/BankyHall.jpg";
import hotelSideHall2 from "@/assets/hotel side hall 2.jpg";
import hotelSideHall3 from "@/assets/hotel side hall 3.jpg";
import { naira, whatsappLink } from "@/lib/hotel";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Meetings, Weddings & Events — Banky Hall, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Banky Hall hosts weddings, conferences, AGMs, training and banquets in Ado-Ekiti from ₦150,000 per day, with catering and accommodation packages.",
      },
      { property: "og:title", content: "Meetings & Events at Banky Hall" },
      {
        property: "og:description",
        content: "One elegant hall in Ado-Ekiti for weddings, conferences, AGMs and banquets.",
      },
    ],
  }),
  component: EventsPage,
});

const PACKAGES = [
  {
    name: "Wedding Banquet",
    price: "From ₦150,000 per day",
    items: [
      "Hall styling & draping",
      "Bridal suite for the night",
      "Catering from our kitchen",
      "Dedicated event manager",
    ],
  },
  {
    name: "Corporate Conference & AGM",
    price: "From ₦150,000 per day",
    items: [
      "Conference & AGM setup",
      "Projector and PA system",
      "Business lunch service",
      "Delegate room rates",
    ],
  },
  {
    name: "Gala & Private Celebration",
    price: "From ₦150,000 per day",
    items: [
      "Birthdays & church events",
      "Open-air bar extension",
      "Custom cake & décor",
      "Late licence available",
    ],
  },
];

function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Banky Hall"
        title="Meetings & Events"
        copy="One hall, dressed for whatever the occasion asks — from a 40-seat board meeting to a 300-guest wedding."
        image={bankyHall}
      />

      <section className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="eyebrow text-muted-foreground">The venue</span>
            <h2 className="mt-4 font-display text-4xl">Banky Hall</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Chandeliers, full drapery and a flexible floor plan — banquet, theatre, classroom or
              cabaret. Our events team handles styling, catering, accommodation for your guests and
              the hundred small things nobody sees.
            </p>
            <p className="mt-6 font-display text-3xl">
              {naira(150000)} <span className="text-base text-muted-foreground">/ day</span>
            </p>
            <a
              href={whatsappLink(
                "Hello Banky Hotel & Suites, I would like to enquire about booking Banky Hall.",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-[0.7rem] tracking-[0.2em] uppercase text-primary-foreground shadow-md hover:opacity-95"
            >
              Enquire about a date
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
            <img
              src={bankyHall}
              alt="Banky Hall set for a wedding banquet"
              loading="lazy"
              width={1200}
              height={900}
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Hall Configurations & Side Halls */}
      <section className="container-x pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <img
              src={hotelSideHall2}
              alt="Executive side hall breakout room"
              loading="lazy"
              width={800}
              height={600}
              className="h-64 w-full rounded-xl object-cover mb-4"
            />
            <h3 className="font-display text-2xl">Executive Breakout Suites</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intimate conference spaces ideal for board meetings, syndicate sessions, VIP holding
              rooms, and executive training.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <img
              src={hotelSideHall3}
              alt="Side hall seminar seating"
              loading="lazy"
              width={800}
              height={600}
              className="h-64 w-full rounded-xl object-cover mb-4"
            />
            <h3 className="font-display text-2xl">Banquet & Dining Wing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Direct access from Banky Hall into our private catering wing and open garden terrace
              for guest receptions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-20 border-t border-border">
        <div className="container-x">
          <span className="eyebrow text-muted-foreground">Tailored Solutions</span>
          <h2 className="mt-2 font-display text-4xl">Event Packages</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <div key={p.name} className="glass rounded-2xl p-8 border border-border/80 shadow-sm">
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="mt-1 text-xs tracking-[0.16em] uppercase text-primary font-semibold">
                  {p.price}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i} className="border-t border-border/60 pt-2.5">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
