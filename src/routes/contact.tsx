import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import receptionImg from "@/assets/Reception.jpg";
import { HOTEL, whatsappLink } from "@/lib/hotel";
import { HotelLocationMap } from "@/components/site/HotelLocationMap";
import { Phone, Mail, Clock, MapPin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Directions — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Reach the Banky Hotel & Suites front desk in Ado-Ekiti by phone, WhatsApp or email. View interactive Google Map directions and local landmarks.",
      },
      { property: "og:title", content: "Contact Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Front desk, reservations and event enquiries in Ado-Ekiti, Ekiti State.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact & directions"
        copy="Our front desk concierge is at your service 24 hours a day to assist with reservations, event hosting, and directions across Ado-Ekiti."
        image={receptionImg}
      />

      <section className="container-x py-20">
        <div className="grid gap-12 lg:grid-cols-2 pb-16 border-b border-border">
          <div>
            <span className="eyebrow text-muted-foreground">Direct Reception</span>
            <h2 className="mt-2 font-display text-4xl">Front Desk & Concierge</h2>
            <dl className="mt-8 space-y-6 text-sm">
              {[
                { label: "Address", value: HOTEL.address, icon: MapPin },
                { label: "Telephone / Reception", value: HOTEL.phone, icon: Phone },
                { label: "Email Address", value: HOTEL.email, icon: Mail },
                {
                  label: "Check-in / Check-out",
                  value: `${HOTEL.checkIn} / ${HOTEL.checkOut}`,
                  icon: Clock,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 border-b border-border pb-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground text-[0.68rem]">{item.label}</dt>
                      <dd className="mt-1 text-base text-foreground font-medium">{item.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Hello Banky Hotel & Suites, I have an enquiry.")}
                target="_blank"
                rel="noreferrer"
                id="contact-whatsapp-btn"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs tracking-[0.16em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp Us</span>
              </a>
              <a
                href={`tel:${HOTEL.phone}`}
                id="contact-call-btn"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-xs tracking-[0.16em] uppercase text-foreground hover:bg-muted"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Front Desk</span>
              </a>
            </div>
          </div>

          {/* Quick Details Box */}
          <div className="rounded-2xl border border-border bg-card/60 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <span className="eyebrow text-muted-foreground">Guest Assistance</span>
              <h3 className="mt-2 font-display text-2xl">Arriving in Ado-Ekiti</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Banky Hotel & Suites provides secure parking with 24/7 on-site security
                surveillance. Guests arriving via Akure Airport or major transit hubs can request
                private chauffeur transfers by contacting the front desk in advance.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Secure walled perimeter with round-the-clock armed personnel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Continuous 24/7 uninterrupted power generator backup</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Complimentary high-speed Wi-Fi across all suites and grounds</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-xl border border-border/80 bg-muted/40 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
                Banky Hall Event Bookings
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                For wedding banquets, corporate AGMs, and private dinners, email
                events@bankyhotelandsuites.com.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Location & Google Maps Section */}
        <div className="mt-16">
          <HotelLocationMap />
        </div>
      </section>
    </>
  );
}
