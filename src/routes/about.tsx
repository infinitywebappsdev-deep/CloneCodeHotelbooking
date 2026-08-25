import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import hotelLobby from "@/assets/Hotel Lobby.jpg";
import leftsideHotelFront from "@/assets/leftside hotel front.jpg";
import rightsideHotelFront from "@/assets/rightside hotel front.jpg";
import reception from "@/assets/Reception.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Banky Hotel & Suites — Boutique Hotel in Ekiti State" },
      {
        name: "description",
        content:
          "The story, values and facilities of Banky Hotel & Suites: a 28-room four-star hotel in Ado-Ekiti, Ekiti State, Nigeria.",
      },
      { property: "og:title", content: "About Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Contemporary elegance and authentic Nigerian hospitality in Ado-Ekiti.",
      },
    ],
  }),
  component: AboutPage,
});

const FACILITIES = [
  "24/7 Concierge",
  "Airport transfer",
  "Business centre",
  "Laundry service",
  "Secure parking",
  "24/7 CCTV & Security",
  "Uninterrupted Power",
  "Reception & Room Service",
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Hospitality, the Ekiti way"
        copy="A four-star boutique hotel built for travellers who notice the details."
        image={leftsideHotelFront}
      />

      <section className="container-x py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-muted-foreground">Architectural Philosophy</span>
            <h2 className="mt-2 font-display text-4xl">Contemporary elegance, authentic welcome</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Banky Hotel & Suites opened with a simple ambition: to give Ekiti State a hotel that
              could stand beside the best without losing its own accent. Twenty-eight rooms and
              suites, one hall, a restaurant that cooks with local produce, and a team that treats
              every arrival as a guest of the house.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We keep our spaces bright and uncluttered — pale stone, frosted glass, brass and
              daylight — so the warmth comes from the people, not the decoration.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
            <img
              src={hotelLobby}
              alt="Hotel lobby interior"
              loading="lazy"
              width={1200}
              height={900}
              className="h-[480px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Property Grounds & Architecture */}
      <section className="container-x pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <img
              src={rightsideHotelFront}
              alt="Banky Hotel east wing grounds and security entrance"
              loading="lazy"
              width={800}
              height={600}
              className="h-64 w-full rounded-xl object-cover mb-4"
            />
            <h3 className="font-display text-2xl">Secure Gated Grounds</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Perimeter security with 24-hour guarded access, ample private parking, and lush
              manicured surroundings.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <img
              src={reception}
              alt="Banky Hotel front desk reception"
              loading="lazy"
              width={800}
              height={600}
              className="h-64 w-full rounded-xl object-cover mb-4"
            />
            <h3 className="font-display text-2xl">24/7 Concierge & Reception</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Attentive staff ready around the clock for seamless check-in, city transfers, and
              local reservations.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-20 border-t border-border">
        <div className="container-x">
          <span className="eyebrow text-muted-foreground">Values</span>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              [
                "Personalised service",
                "We remember your room preference, your breakfast, your name.",
              ],
              ["Modern African elegance", "Design that is contemporary without being anonymous."],
              ["Memorable stays", "Small gestures, consistently delivered, every single visit."],
            ].map(([title, copy]) => (
              <div key={title} className="glass rounded-2xl p-8 border border-border/80 shadow-sm">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-20 font-display text-3xl sm:text-4xl">Facilities & Amenities</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-muted-foreground md:grid-cols-4">
            {FACILITIES.map((f) => (
              <li key={f} className="border-t border-border/70 pt-3">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
