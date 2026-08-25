import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import standard from "@/assets/room-standard.jpg";
import { HOTEL } from "@/lib/hotel";

const FAQS = [
  [
    "What are your check-in and check-out times?",
    `Check-in is from ${HOTEL.checkIn} and check-out is by ${HOTEL.checkOut}. Early check-in and late check-out can be arranged subject to availability.`,
  ],
  [
    "How do I pay?",
    "You can pay securely online with Paystack (card, bank transfer, USSD or QR), or settle at the front desk on arrival. Card, transfer and cash are accepted.",
  ],
  [
    "Can I cancel or change my booking?",
    "Yes. Cancellations made more than 48 hours before arrival are free of charge. Within 48 hours, one night is charged.",
  ],
  [
    "Is breakfast included?",
    "Breakfast for two is complimentary on all direct bookings made through this website or our WhatsApp concierge.",
  ],
  [
    "Do you offer airport transfers?",
    "We do. Let our concierge know your flight details at least 24 hours ahead and we will arrange a car.",
  ],
  [
    "Is parking available?",
    "Yes — secure on-site parking with 24-hour CCTV and security is complimentary for guests.",
  ],
  [
    "Can I book Banky Hall separately from a room?",
    "Absolutely. The hall can be booked on its own for weddings, conferences, AGMs, training sessions and celebrations.",
  ],
];

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Answers on check-in times, payment, cancellation, breakfast, airport transfers and event bookings at Banky Hotel & Suites, Ado-Ekiti.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Everything you need to know before your stay in Ado-Ekiti.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: FaqsPage,
});

function FaqsPage() {
  return (
    <>
      <PageHero eyebrow="Good to know" title="Frequently asked questions" image={standard} />
      <section className="container-x py-20">
        <div className="mx-auto max-w-3xl divide-y divide-border">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl">
                {q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
