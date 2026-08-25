import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import restaurant2 from "@/assets/Restaurant 2.jpg";
import openBarGarden from "@/assets/OpenBar Garden.jpg";
import openBarGarden2 from "@/assets/OpenBar Garden 2.jpg";
import openBarSitout from "@/assets/OpenBar sitout.jpg";
import ballardTable from "@/assets/Ballard Table.jpg";
import { whatsappLink } from "@/lib/hotel";

export const Route = createFileRoute("/dining")({
  head: () => ({
    meta: [
      { title: "Restaurant, Lounge & Open-Air Bar — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "Nigerian classics and international fine dining at Restaurant 2, a cocktail lounge, billiard tables, and an open-air bar garden with monthly karaoke at Banky Hotel & Suites, Ado-Ekiti.",
      },
      { property: "og:title", content: "Dining & Lounge — Banky Hotel & Suites" },
      {
        property: "og:description",
        content:
          "Breakfast buffet, chef specials, Sunday brunch and cocktails under the stars in Ado-Ekiti.",
      },
    ],
  }),
  component: DiningPage,
});

const MENU = [
  [
    "Breakfast Buffet",
    "6:30 – 10:30",
    "Nigerian and continental spreads, made to order eggs, fresh juices.",
  ],
  ["Business Lunch", "12:00 – 15:00", "A two-course set menu built for a one-hour meeting."],
  ["Chef Specials", "18:00 – 22:30", "Seasonal Ekiti produce plated with an international hand."],
  ["Sunday Brunch", "11:00 – 16:00", "Long tables, live acoustic sets and a carving station."],
];

function DiningPage() {
  return (
    <>
      <PageHero
        eyebrow="Restaurant · Lounge · Bar"
        title="Dining at Banky"
        copy="Traditional Nigerian cuisine and international fine dining, served indoors, outdoors or privately."
        image={restaurant2}
      />

      <section className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-muted-foreground">The Restaurant</span>
            <h2 className="mt-4 text-4xl">A kitchen rooted in Ekiti</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Our kitchen cooks the food of this region with restraint and precision — pounded yam
              and egusi beside a dry-aged steak, a wine list that travels further than most in the
              state. Private dining, takeaway and outdoor tables are all available.
            </p>
            <a
              href={whatsappLink(
                "Hello Banky Hotel & Suites, I would like to reserve a table at the restaurant.",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-[0.7rem] tracking-[0.2em] uppercase text-primary-foreground"
            >
              Reserve a table
            </a>
          </div>
          <div className="glass rounded-sm p-8">
            {MENU.map(([title, time, copy]) => (
              <div
                key={title}
                className="border-b border-border/60 py-5 last:border-0 last:pb-0 first:pt-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl">{title}</h3>
                  <span className="text-xs tracking-[0.14em] uppercase text-muted-foreground">
                    {time}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Air Bar & Garden */}
      <section className="bg-secondary/50 py-20">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:items-center">
          <img
            src={openBarGarden}
            alt="Open-air bar garden with ambient lighting and cocktails"
            loading="lazy"
            width={1200}
            height={900}
            className="h-[480px] w-full rounded-2xl border border-border object-cover shadow-lg"
          />
          <div>
            <span className="eyebrow text-muted-foreground">Lounge & Open-Air Bar Garden</span>
            <h2 className="mt-4 text-4xl">Evenings that run long</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Cocktails mixed to order, a considered whisky shelf and wine by the glass. Sports
              viewing indoors, string lights outdoors in our garden sit-out, and karaoke night once
              a month for anyone brave enough.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "Signature cocktails",
                "Whisky & wine list",
                "Live sports viewing",
                "Monthly karaoke night",
                "Open garden sitout",
                "Barbecue specials",
              ].map((item) => (
                <li key={item} className="border-t border-border pt-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recreation & Billiard Lounge */}
      <section className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-muted-foreground">Guest Recreation</span>
            <h2 className="mt-4 text-4xl">Billiard & Ballard Lounge</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Unwind with colleagues and fellow travelers around our tournament-grade Ballard and
              billiard tables, accompanied by bar service and curated acoustic tunes.
            </p>
          </div>
          <img
            src={ballardTable}
            alt="Ballard and billiard table in Banky lounge"
            loading="lazy"
            width={1200}
            height={900}
            className="h-[420px] w-full rounded-2xl border border-border object-cover shadow-lg"
          />
        </div>
      </section>
    </>
  );
}
