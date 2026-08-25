import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
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

      <section className="container-x py-20">
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
              className="mt-14 h-[460px] w-full rounded-sm object-cover"
            />
          </div>

          <aside className="glass h-fit rounded-sm p-8 lg:sticky lg:top-32">
            <span className="eyebrow text-muted-foreground">Reserve</span>
            <p className="mt-4 font-display text-4xl">{naira(room.rate)}</p>
            <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">per night</p>

            <a
              href={whatsappLink(bookingMessage({ room: room.name, rate: room.rate, reference }))}
              target="_blank"
              rel="noreferrer"
              className="mt-8 block rounded-full bg-primary px-6 py-3.5 text-center text-[0.7rem] tracking-[0.2em] uppercase text-primary-foreground"
            >
              Book on WhatsApp
            </a>
            <a
              href={HOTEL.paystack}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-full border border-border px-6 py-3.5 text-center text-[0.7rem] tracking-[0.2em] uppercase"
            >
              Pay with Paystack
            </a>
            <Link
              to="/reserve"
              className="mt-3 block px-6 py-2 text-center text-[0.7rem] tracking-[0.2em] uppercase underline underline-offset-8"
            >
              Full reservation form
            </Link>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Reference {reference} · Check-in {HOTEL.checkIn}, check-out {HOTEL.checkOut}. Rates
              include taxes and service charge.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
