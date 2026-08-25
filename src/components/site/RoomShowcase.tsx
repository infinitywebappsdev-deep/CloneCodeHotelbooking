import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Wifi,
  Tv,
  Wind,
  Coffee,
  CheckCircle2,
  Users,
  Maximize2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BedDouble,
  X,
} from "lucide-react";
import { ROOMS, Room, naira } from "@/lib/hotel";

interface RoomShowcaseProps {
  initialCategory?: string;
  showAllLink?: boolean;
}

export function RoomShowcase({ showAllLink = true }: RoomShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalRoom, setActiveModalRoom] = useState<Room | null>(null);

  const categories = [
    { id: "all", label: "All Suites & Rooms" },
    { id: "suites", label: "Luxury Suites" },
    { id: "executive", label: "Executive" },
    { id: "standard", label: "Standard & Deluxe" },
  ];

  const filteredRooms = ROOMS.filter((room) => {
    if (selectedCategory === "suites") {
      return (
        room.slug.includes("suite") ||
        room.slug === "signature-suite" ||
        room.slug === "diplomatic-suite"
      );
    }
    if (selectedCategory === "executive") {
      return room.slug.includes("executive");
    }
    if (selectedCategory === "standard") {
      return room.slug.includes("standard") || room.slug === "deluxe" || room.slug === "studio";
    }
    return true;
  });

  return (
    <div id="room-showcase-container" className="w-full">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-foreground text-background shadow-md"
                  : "border border-border/80 bg-background/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {showAllLink && (
          <Link
            to="/rooms"
            id="view-all-categories-link"
            className="group inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-foreground/80 hover:text-foreground"
          >
            <span>Explore All 28 Rooms</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Glassmorphism Room Cards Grid */}
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <article
            key={room.slug}
            id={`room-card-${room.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl"
          >
            {/* Dynamic Photo Container with subtle zoom */}
            <div className="relative h-72 w-full overflow-hidden bg-muted">
              <img
                src={room.image}
                alt={room.name}
                loading="lazy"
                width={1200}
                height={900}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Glassmorphism Price Overlay Badge */}
              <div className="absolute top-4 right-4 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 backdrop-blur-md">
                <span className="font-display text-sm tracking-wide text-white">
                  {naira(room.rate)}
                </span>
                <span className="text-[0.65rem] tracking-wider uppercase text-white/75">
                  {" "}
                  / night
                </span>
              </div>

              {/* Room Occupancy & Area Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur-sm">
                    <Users className="h-3.5 w-3.5 text-white/80" />
                    <span>{room.occupancy}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur-sm">
                    <Maximize2 className="h-3.5 w-3.5 text-white/80" />
                    <span>{room.size}</span>
                  </span>
                </div>
                <button
                  type="button"
                  id={`quick-look-btn-${room.slug}`}
                  onClick={() => setActiveModalRoom(room)}
                  className="rounded-full bg-white/20 px-3 py-1 text-[0.65rem] tracking-wider uppercase text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  Quick view
                </button>
              </div>
            </div>

            {/* Content Body with Glass Details */}
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-2xl text-foreground group-hover:text-primary">
                    {room.name}
                  </h3>
                  {room.rate >= 75000 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-3 w-3" />
                      Suite
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {room.blurb}
                </p>

                {/* Features Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {room.features.slice(0, 3).map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[0.7rem] text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {feat}
                    </span>
                  ))}
                  {room.features.length > 3 && (
                    <span className="rounded-md border border-border/50 bg-muted/20 px-1.5 py-1 text-[0.7rem] text-muted-foreground">
                      +{room.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <Link
                  to="/reserve"
                  id={`book-now-${room.slug}`}
                  className="flex-1 rounded-full bg-primary py-2.5 text-center text-xs tracking-[0.14em] uppercase text-primary-foreground transition-transform hover:opacity-95 active:scale-95"
                >
                  Reserve Suite
                </Link>
                <Link
                  to="/rooms/$slug"
                  params={{ slug: room.slug }}
                  id={`explore-room-${room.slug}`}
                  className="rounded-full border border-border px-4 py-2.5 text-center text-xs tracking-[0.14em] uppercase text-foreground hover:bg-muted"
                >
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Quick View Glassmorphism Modal */}
      {activeModalRoom && (
        <div
          id="room-quick-view-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveModalRoom(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="close-room-modal"
              onClick={() => setActiveModalRoom(null)}
              className="absolute top-5 right-5 rounded-full bg-muted p-2 text-muted-foreground hover:bg-foreground hover:text-background"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={activeModalRoom.image}
                alt={activeModalRoom.name}
                className="h-64 w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="eyebrow text-muted-foreground">Banky Hotel Accommodation</span>
                <h2 className="mt-1 font-display text-3xl">{activeModalRoom.name}</h2>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl text-foreground">
                  {naira(activeModalRoom.rate)}
                </span>
                <span className="text-xs text-muted-foreground"> / night</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {activeModalRoom.blurb}
            </p>

            {/* Quick Specs */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-border/80 bg-muted/40 p-4 text-center">
              <div>
                <span className="block text-[0.65rem] tracking-wider uppercase text-muted-foreground">
                  Occupancy
                </span>
                <span className="mt-1 font-medium text-sm">{activeModalRoom.occupancy}</span>
              </div>
              <div className="border-x border-border/60">
                <span className="block text-[0.65rem] tracking-wider uppercase text-muted-foreground">
                  Room Size
                </span>
                <span className="mt-1 font-medium text-sm">{activeModalRoom.size}</span>
              </div>
              <div>
                <span className="block text-[0.65rem] tracking-wider uppercase text-muted-foreground">
                  Bed Setup
                </span>
                <span className="mt-1 font-medium text-sm">King / Queen Bed</span>
              </div>
            </div>

            {/* Amenities Included */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Included Amenities & Features
              </h4>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {activeModalRoom.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{feat}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-foreground/90">
                  <Wifi className="h-4 w-4 text-primary" />
                  <span>High-speed fibre Wi-Fi</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Tv className="h-4 w-4 text-primary" />
                  <span>4K Smart TV with DSTV</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Wind className="h-4 w-4 text-primary" />
                  <span>Individual Climate Control</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <Coffee className="h-4 w-4 text-primary" />
                  <span>Complimentary Breakfast</span>
                </li>
                <li className="flex items-center gap-2 text-foreground/90">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>24/7 Security & Keycard Access</span>
                </li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <Link
                to="/reserve"
                id="modal-reserve-btn"
                onClick={() => setActiveModalRoom(null)}
                className="flex-1 rounded-full bg-primary py-3 text-center text-xs tracking-[0.16em] uppercase text-primary-foreground"
              >
                Inquire & Book This Room
              </Link>
              <Link
                to="/rooms/$slug"
                params={{ slug: activeModalRoom.slug }}
                id="modal-full-specs-btn"
                className="rounded-full border border-border px-6 py-3 text-xs tracking-[0.16em] uppercase text-foreground hover:bg-muted"
              >
                Full Room Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
