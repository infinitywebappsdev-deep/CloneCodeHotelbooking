import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { RoomAvailabilityCalendar } from "@/components/site/RoomAvailabilityCalendar";
import { RoomReviewsSection } from "@/components/site/RoomReviewsSection";
import { ROOMS, naira, whatsappLink, bookingMessage, makeReference, HOTEL } from "@/lib/hotel";

export const Route = createFileRoute("/rooms/$slug")({
  loader: ({ params }) => {
    const room = ROOMS.find((r) => r.slug === params.slug);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Room not found — Banky Hotel & Suites" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { room } = loaderData;
    return {
      meta: [
        { title: `${room.name} — Banky Hotel & Suites, Ado-Ekiti` },
        {
          name: "description",
          content: `${room.blurb} From ${naira(room.rate)} per night in Ado-Ekiti.`,
        },
        { property: "og:title", content: `${room.name} — Banky Hotel & Suites` },
        { property: "og:description", content: room.blurb },
      ],
    };
  },
  component: RoomDetail,
});

function RoomDetail() {
  const { room } = Route.useLoaderData();
  const reference = makeReference();

  return (
    <>
      <PageHero eyebrow="Accommodation" title={room.name} copy={room.blurb} image={room.image} />

      <section className="container-x py-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-3xl">The room</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {room.blurb} Every stay includes complimentary Wi-Fi, a smart TV, air conditioning,
              daily housekeeping and access to 24-hour room service, concierge and secure parking.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["Size", room.size],
                ["Occupancy", room.occupancy],
                ["Available", `${room.qty} rooms`],
                ["Rate", naira(room.rate)],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-border pt-3">
                  <dt className="eyebrow text-muted-foreground">{k}</dt>
                  <dd className="mt-2 font-display text-xl">{v}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-14 text-2xl">In this category</h3>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {room.features.map((f: string) => (
                <li key={f} className="border-t border-border pt-2">
                  {f}
                </li>
              ))}
            </ul>

            <img
              src={room.image}
              alt={`${room.name} interior`}
              loading="lazy"
              width={1200}
              height={900}
              className="mt-14 h-[440px] w-full rounded-2xl object-cover shadow-sm"
            />

            {/* Visual Monthly Availability Calendar */}
            <div className="mt-14">
              <h3 className="text-2xl font-display mb-4">Availability Calendar</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Check dates and reserve directly. Fully booked dates are marked and disabled
                automatically.
              </p>
              <RoomAvailabilityCalendar
                roomSlug={room.slug}
                roomName={room.name}
                rate={room.rate}
              />
            </div>

            {/* Star Rating and Comment Section */}
            <RoomReviewsSection roomSlug={room.slug} roomName={room.name} />
          </div>

          <aside className="glass h-fit rounded-2xl p-8 lg:sticky lg:top-32 border border-border/80 shadow-md">
            <span className="eyebrow text-amber-500 font-semibold">Reserve Online</span>
            <p className="mt-3 font-display text-4xl font-bold">{naira(room.rate)}</p>
            <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">per night</p>

            <Link
              to="/reserve"
              search={{ room: room.slug }}
              className="mt-8 block rounded-full bg-primary px-6 py-3.5 text-center text-[0.75rem] font-semibold tracking-[0.16em] uppercase text-primary-foreground shadow-md transition-opacity hover:opacity-95"
            >
              Book This Room
            </Link>

            <a
              href={whatsappLink(bookingMessage({ room: room.name, rate: room.rate, reference }))}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-full border border-border/80 px-6 py-3 text-center text-[0.72rem] tracking-[0.16em] uppercase hover:bg-muted/40 transition-colors"
            >
              Book on WhatsApp
            </a>

            <a
              href={HOTEL.paystack}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-full border border-border/80 px-6 py-3 text-center text-[0.72rem] tracking-[0.16em] uppercase hover:bg-muted/40 transition-colors"
            >
              Pay with Paystack
            </a>

            <div className="mt-6 rounded-xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-foreground">Direct Booking Privileges</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• Complimentary breakfast for two</li>
                <li>• Flexible check-in (2:00 PM) &amp; check-out (12:00 PM)</li>
                <li>• Free high-speed Wi-Fi and secure gated parking</li>
                <li>• Instant Paystack card &amp; transfer checkout</li>
              </ul>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              Reference {reference}. Rates include statutory VAT and hospitality tourism levy.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
