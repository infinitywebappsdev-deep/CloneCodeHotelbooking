import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import receptionImg from "@/assets/Reception.jpg";
import { HOTEL, whatsappLink } from "@/lib/hotel";
import { HotelLocationMap } from "@/components/site/HotelLocationMap";
import { ContactForm } from "@/components/site/ContactForm";
import { Phone, Mail, Clock, MapPin, MessageSquare, ShieldCheck, Zap, Wifi } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Directions — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Reach Banky Hotel & Suites in Ado-Ekiti. Send a direct inquiry, contact our 24/7 reception desk, or view interactive Google Map directions.",
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

      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 pb-16 border-b border-border">
          {/* Main Contact Form Column */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Front Desk & Reception Info Column */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 shadow-xs">
              <span className="eyebrow text-muted-foreground">Direct Reception</span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-serif">
                Front Desk & Concierge
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Prefer immediate telephone or WhatsApp communication? Reach our on-duty supervisors.
              </p>

              <dl className="mt-6 space-y-4 text-sm">
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
                      className="flex items-start gap-3.5 border-b border-border/60 pb-3.5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <dt className="eyebrow text-muted-foreground text-[0.65rem]">
                          {item.label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-foreground font-medium">{item.value}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2.5 pt-2">
                <a
                  href={whatsappLink("Hello Banky Hotel & Suites, I have an enquiry.")}
                  target="_blank"
                  rel="noreferrer"
                  id="contact-whatsapp-btn"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs tracking-[0.14em] uppercase text-primary-foreground transition-opacity hover:opacity-90 font-medium"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href={`tel:${HOTEL.phone}`}
                  id="contact-call-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs tracking-[0.14em] uppercase text-foreground hover:bg-muted font-medium"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Front Desk</span>
                </a>
              </div>
            </div>

            {/* Quick Details Box */}
            <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8 shadow-xs">
              <span className="eyebrow text-muted-foreground">Guest Assistance</span>
              <h3 className="mt-1 font-display text-xl font-serif">Arriving in Ado-Ekiti</h3>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Banky Hotel & Suites provides secure parking with 24/7 on-site security
                surveillance. Guests arriving via Akure Airport or major transit hubs can request
                private chauffeur transfers by contacting the front desk in advance.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Secure walled perimeter with round-the-clock armed security</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Continuous 24/7 uninterrupted power generator backup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Complimentary high-speed Wi-Fi across all suites and grounds</span>
                </li>
              </ul>

              <div className="mt-6 rounded-xl border border-border/80 bg-muted/40 p-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
                  Banky Hall & Event Enquiries
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  For wedding banquets, corporate conferences, and private dinners, contact our
                  events team directly at{" "}
                  <a
                    href="mailto:events@bankyhotelandsuites.com"
                    className="underline text-foreground"
                  >
                    events@bankyhotelandsuites.com
                  </a>
                  .
                </p>
              </div>
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
