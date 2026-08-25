import { createFileRoute, Link } from "@tanstack/react-router";
import heroVideo from "@/assets/hero-video.mp4.asset.json";
import heroPoster from "@/assets/hero-exterior.jpg";
import hotelLobby from "@/assets/Hotel Lobby.jpg";
import diningImg from "@/assets/Restaurant 2.jpg";
import loungeImg from "@/assets/OpenBar Garden.jpg";
import eventsImg from "@/assets/BankyHall.jpg";
import { BookingBar } from "@/components/site/BookingBar";
import { RoomShowcase } from "@/components/site/RoomShowcase";
import { MasonryGallery } from "@/components/site/MasonryGallery";
import { TestimonialSlider } from "@/components/site/TestimonialSlider";
import { HotelLocationMap } from "@/components/site/HotelLocationMap";
import { Sparkles, Compass, ShieldCheck, ArrowRight, Camera } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banky Hotel & Suites — Luxury Boutique Hotel in Ado-Ekiti" },
      {
        name: "description",
        content:
          "Book direct at Banky Hotel & Suites, Ado-Ekiti. 28 rooms and suites, Nigerian fine dining, an open-air bar, Banky Hall, and instant automated AI reservations.",
      },
      {
        property: "og:title",
        content: "Banky Hotel & Suites — Luxury Boutique Hotel in Ado-Ekiti",
      },
      {
        property: "og:description",
        content:
          "A tranquil four-star boutique retreat in Ekiti State with contemporary glass architecture, gourmet restaurant, and Google Gemini AI concierge.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero Video & Direct Booking */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={heroPoster}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75" />

        <div className="container-x relative flex h-full flex-col justify-end pb-10">
          <div className="rise max-w-2xl pb-10 text-white">
            <span className="eyebrow text-amber-300/90 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Ado-Ekiti · Ekiti State · Nigeria
            </span>
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-7xl font-display">
              Quiet luxury in the heart of Ado-Ekiti
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 font-light">
              Twenty-eight curated rooms and luxury suites, an open-air bar garden, and Nigerian
              fine dining — elevated by hospitality that anticipates your every need.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/reserve"
                id="hero-reserve-btn"
                className="rounded-full bg-white px-8 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-black shadow-lg hover:bg-white/90 transition-transform active:scale-95"
              >
                Reserve Your Stay
              </Link>
              <Link
                to="/rooms"
                id="hero-explore-rooms-btn"
                className="rounded-full border border-white/40 bg-black/30 px-7 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-white backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                Explore Rooms
              </Link>
            </div>
          </div>
          <BookingBar floating />
        </div>
      </section>

      {/* Boutique Story / Introduction */}
      <section className="container-x py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              The Boutique Experience
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">
              An architectural address built around calm, light, and attentive service.
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Banky Hotel & Suites was conceived as a sanctuary for discerning travelers who seek
              the finesse and security of an international luxury property paired with the warmth of
              Ekiti hospitality. Frosted glass, warm ambient timber, and polished brass detailing
              define our aesthetic.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["28", "Rooms & Suites"],
                ["1", "Banky Hall"],
                ["24/7", "Concierge & Power"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl sm:text-4xl text-foreground">{value}</dt>
                  <dd className="mt-1 text-[0.68rem] tracking-[0.14em] uppercase text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img
              src={hotelLobby}
              alt="Bright hotel lobby with frosted glass partitions and marble floors"
              loading="lazy"
              width={1200}
              height={900}
              className="h-[480px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Room Showcase with Glassmorphism Cards & Filters */}
      <section className="bg-secondary/40 py-24 border-t border-border/60">
        <div className="container-x">
          <div className="mb-10 text-center sm:text-left">
            <span className="eyebrow text-muted-foreground">Tailored Accommodation</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Rooms & Luxury Suites</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Each accommodation is crafted with sound-insulated architecture, plush bedding,
              en-suite rainfall showers, and complimentary high-speed connectivity.
            </p>
          </div>

          <RoomShowcase showAllLink={true} />
        </div>
      </section>

      {/* Dining & Experiences */}
      <section className="container-x py-24">
        <span className="eyebrow text-muted-foreground">Bespoke Experiences</span>
        <h2 className="mt-4 max-w-xl font-display text-4xl sm:text-5xl">Eat, Gather, Celebrate</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              img: diningImg,
              title: "The Restaurant",
              copy: "Authentic Ekiti delicacies, Nigerian culinary classics, and continental fare prepared fresh by executive chefs.",
              to: "/dining" as const,
            },
            {
              img: loungeImg,
              title: "Open-Air Bar & Lounge",
              copy: "Crafted cocktails, chilled spirits, barbecue specials, and vibrant open-sky evenings.",
              to: "/dining" as const,
            },
            {
              img: eventsImg,
              title: "Banky Hall & Banquets",
              copy: "State-of-the-art venue space accommodating up to 300 guests for executive seminars, galas, and weddings.",
              to: "/events" as const,
            },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              id={`experience-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative overflow-hidden rounded-xl border border-border shadow-md"
            >
              <img
                src={card.img}
                alt={card.title}
                loading="lazy"
                width={1200}
                height={900}
                className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-black/60 p-5 text-white backdrop-blur-md">
                <h3 className="font-display text-2xl">{card.title}</h3>
                <p className="mt-1.5 text-xs text-white/80 leading-relaxed">{card.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Visual Architecture & Amenities Masonry Gallery with Interactive Lightbox */}
      <section className="bg-secondary/30 py-24 border-t border-border/60">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="eyebrow text-muted-foreground flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-primary" />
                Spaces & Interior Architecture
              </span>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                Amenities & Interior Showcase
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Take a closer look at our luxury suites, open-air bar gardens, Restaurant 2, and
                Banky Hall. Click any image to explore full architectural details.
              </p>
            </div>
            <Link
              to="/gallery"
              id="home-explore-full-gallery-btn"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-semibold tracking-wider uppercase text-foreground hover:bg-muted transition-colors"
            >
              <span>View All 33 Spaces</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <MasonryGallery showFilters={true} limit={8} />
        </div>
      </section>

      {/* Customer Testimonial Slider (Connected to Firestore) */}
      <TestimonialSlider />

      {/* Interactive Hotel Location Map */}
      <section className="container-x py-24">
        <HotelLocationMap />
      </section>

      {/* Direct Booking Call to Action */}
      <section className="container-x pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-card/80 px-8 py-16 text-center shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/10 blur-3xl" />
          <span className="eyebrow text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Guaranteed Best Direct Rates
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl sm:text-5xl">
            Experience Calm Luxury in Ado-Ekiti
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Book directly through our automated reservation system to receive instant confirmation,
            complimentary breakfast, 24/7 dedicated concierge assistance, and flexible cancellation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/reserve"
              id="cta-reserve-btn"
              className="inline-block rounded-full bg-primary px-9 py-4 text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Reserve Your Stay
            </Link>
            <Link
              to="/contact"
              id="cta-contact-btn"
              className="inline-block rounded-full border border-border px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase text-foreground hover:bg-muted"
            >
              Contact Front Desk
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
