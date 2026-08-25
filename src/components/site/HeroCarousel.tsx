import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Maximize2,
  Users,
  ShieldCheck,
  Pause,
  Play,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import signatureSuiteImg from "@/assets/Signature Suite.jpg";
import diplomaticSuiteImg from "@/assets/Diplomatic Suite.jpg";
import superExecutiveImg from "@/assets/Super Executive.jpg";
import executiveSuiteImg from "@/assets/Executive Suite.jpg";
import diningImg from "@/assets/Restaurant 2.jpg";
import gardenBarImg from "@/assets/OpenBar Garden.jpg";
import bankyHallImg from "@/assets/BankyHall.jpg";
import hotelLobbyImg from "@/assets/Hotel Lobby.jpg";
import { naira } from "@/lib/hotel";

export interface CarouselSlide {
  id: string;
  type: "suite" | "facility";
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  image: string;
  price?: number;
  occupancy?: string;
  size?: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  roomSlug?: string;
}

export const HERO_SLIDES: CarouselSlide[] = [
  {
    id: "signature-suite",
    type: "suite",
    title: "Signature Suite",
    subtitle: "Presidential Luxury & Master Residence",
    tagline: "Our Flagship Penthouse Suite",
    description:
      "A sunlit residence framed by floor-to-ceiling glass, private master living room, expansive marble bathroom, and 24/7 dedicated butler service.",
    image: signatureSuiteImg,
    price: 150000,
    occupancy: "2-3 Guests",
    size: "78 sqm",
    highlights: [
      "Private Living Room",
      "Dedicated Butler Service",
      "Complimentary Breakfast",
      "VIP Airport Concierge",
    ],
    ctaText: "Reserve Signature Suite",
    ctaLink: "/reserve?room=signature-suite",
    roomSlug: "signature-suite",
  },
  {
    id: "diplomatic-suite",
    type: "suite",
    title: "Diplomatic Suite",
    subtitle: "Dignitary Comfort & Executive Lounge",
    tagline: "Distinguished Elegance",
    description:
      "Crafted for traveling executives and state guests with an acoustic-sealed lounge, executive desk, high-speed fiber Wi-Fi, and late checkout.",
    image: diplomaticSuiteImg,
    price: 75000,
    occupancy: "2 Guests",
    size: "56 sqm",
    highlights: [
      "Separate Executive Lounge",
      "Work Desk & Ergonomic Chair",
      "Gourmet Breakfast for Two",
      "Complimentary Minibar",
    ],
    ctaText: "Book Diplomatic Suite",
    ctaLink: "/reserve?room=diplomatic-suite",
    roomSlug: "diplomatic-suite",
  },
  {
    id: "super-executive",
    type: "suite",
    title: "Super Executive Room",
    subtitle: "Sophisticated Calm & Warm Timber",
    tagline: "Refined Modern Comfort",
    description:
      "Generous proportions featuring a plush king bed, private reading nook, walk-in rain shower, and curated contemporary Nigerian artwork.",
    image: superExecutiveImg,
    price: 55000,
    occupancy: "2 Guests",
    size: "42 sqm",
    highlights: [
      "King Size Pillowtop Bed",
      "Reading Corner & Smart TV",
      "Rainfall Power Shower",
      "24/7 Room Service",
    ],
    ctaText: "Select Super Executive",
    ctaLink: "/reserve?room=super-executive",
    roomSlug: "super-executive",
  },
  {
    id: "restaurant-dining",
    type: "facility",
    title: "Restaurant & Fine Dining",
    subtitle: "Ekiti Gourmet & Continental Cuisine",
    tagline: "Culinary Excellence",
    description:
      "Experience elevated Nigerian classics like pounded yam with rich egusi and fresh catfish soup alongside continental delicacies in a tranquil setting.",
    image: diningImg,
    highlights: [
      "Farm-to-Table Fresh Ingredients",
      "Breakfast, Lunch & Dinner",
      "Private Dining Rooms",
      "Chef's Special Menus",
    ],
    ctaText: "Explore Dining & Menus",
    ctaLink: "/dining",
  },
  {
    id: "open-bar-garden",
    type: "facility",
    title: "Open-Air Garden Bar & Lounge",
    subtitle: "Craft Cocktails, Suya & Sunset Vibes",
    tagline: "Al Fresco Leisure",
    description:
      "Relax beneath lush foliage with signature cocktails, chilled wines, gourmet grilled suya, and ambient evening acoustics.",
    image: gardenBarImg,
    highlights: [
      "Signature Cocktails & Mocktails",
      "Artisan Suya & Small Chops",
      "Breezy Garden Seating",
      "Weekend Live Acoustic Music",
    ],
    ctaText: "View Bar & Lounge",
    ctaLink: "/dining",
  },
  {
    id: "banky-hall",
    type: "facility",
    title: "Banky Hall & Event Center",
    subtitle: "State Conferences, Banquets & Celebrations",
    tagline: "Premier Event Destination",
    description:
      "A climate-controlled multi-purpose event space accommodating up to 350 guests with modern AV projection, stage lighting, and bespoke catering.",
    image: bankyHallImg,
    highlights: [
      "Up to 350 Guest Capacity",
      "Integrated Audio/Visual & Stage",
      "Full Banquet Catering Services",
      "Dedicated Event Coordinator",
    ],
    ctaText: "Inquire About Events",
    ctaLink: "/events",
  },
  {
    id: "lobby-reception",
    type: "facility",
    title: "Grand Lobby & Concierge",
    subtitle: "24/7 Security, Uninterrupted Power & Warmth",
    tagline: "Welcome to Ado-Ekiti",
    description:
      "From seamless arrival to tailored local travel excursions, our 24/7 front desk team ensures your stay in Ekiti is effortless and safe.",
    image: hotelLobbyImg,
    highlights: [
      "24/7 Uninterrupted Clean Power",
      "Armed Security & Monitored CCTV",
      "Luggage Storage & Valet",
      "Local Tour & Driver Booking",
    ],
    ctaText: "View Hotel Amenities",
    ctaLink: "/about",
  },
];

export function HeroCarousel({
  autoPlayInterval = 6000,
  className = "",
}: {
  autoPlayInterval?: number;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const currentSlide = HERO_SLIDES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Autoplay and progress bar
  useEffect(() => {
    if (!isPlaying) return;

    const stepMs = 50;
    const progressStep = (stepMs / autoPlayInterval) * 100;

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          nextSlide();
          return 0;
        }
        return old + progressStep;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, nextSlide, currentIndex]);

  // Touch Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? null;
    if (touchEndX === null) return;

    const diff = touchStartX.current - touchEndX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-black text-white ${className}`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="hero-suites-carousel"
    >
      {/* Background Images with Crossfade */}
      <div className="relative h-[680px] sm:h-[760px] lg:h-[820px] w-full">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`h-full w-full object-cover transition-transform duration-10000 ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Premium dark gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:w-3/4" />
            </div>
          );
        })}

        {/* Content Container */}
        <div className="container-x relative z-20 flex h-full flex-col justify-between pt-24 pb-12 sm:pt-28 sm:pb-16">
          {/* Top category / progress header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-amber-300 backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                {currentSlide.type === "suite" ? "Curated Luxury Suite" : "Hotel Facility"}
              </span>
              <span className="hidden sm:inline-block text-xs font-light tracking-widest text-white/70 uppercase">
                {currentSlide.tagline}
              </span>
            </div>

            {/* Controls: Play/Pause and Counter */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>
              <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-mono tracking-widest text-white/90 backdrop-blur-md">
                <span className="text-amber-300 font-bold">
                  {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-white/40 mx-1">/</span>
                <span>{String(HERO_SLIDES.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          {/* Main Slide Typography & Information */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium tracking-[0.2em] text-amber-300 uppercase">
                  {currentSlide.subtitle}
                </p>
                <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-white">
                  {currentSlide.title}
                </h2>
              </div>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/85 font-light">
                {currentSlide.description}
              </p>

              {/* Highlights & specs chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {currentSlide.price && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    From{" "}
                    <strong className="text-amber-300 font-serif text-sm">
                      {naira(currentSlide.price)}
                    </strong>{" "}
                    / night
                  </span>
                )}
                {currentSlide.occupancy && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-md">
                    <Users className="h-3 w-3 text-amber-300" />
                    {currentSlide.occupancy}
                  </span>
                )}
                {currentSlide.size && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-md">
                    <Maximize2 className="h-3 w-3 text-amber-300" />
                    {currentSlide.size}
                  </span>
                )}
              </div>

              {/* Feature bullet list */}
              <div className="grid grid-cols-2 gap-2 pt-1 max-w-xl text-xs text-white/80">
                {currentSlide.highlights.slice(0, 4).map((hl) => (
                  <div key={hl} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{hl}</span>
                  </div>
                ))}
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  to={currentSlide.ctaLink}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase text-black shadow-lg hover:bg-amber-300 transition-all active:scale-95"
                >
                  <span>{currentSlide.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {currentSlide.roomSlug && (
                  <Link
                    to={`/rooms/${currentSlide.roomSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                  >
                    View Room Gallery
                  </Link>
                )}
              </div>
            </div>

            {/* Slide Navigation Thumbnails on Desktop */}
            <div className="hidden lg:col-span-4 lg:flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span>Featured Collection</span>
                <span className="text-[11px] text-white/40">Click to preview</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HERO_SLIDES.slice(0, 4).map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`group relative flex items-center gap-2 rounded-lg border p-1.5 text-left transition-all overflow-hidden ${
                      idx === currentIndex
                        ? "border-amber-400 bg-white/20 shadow-md ring-1 ring-amber-400/50"
                        : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-10 w-12 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-medium text-white truncate">{slide.title}</p>
                      <p className="text-[10px] text-white/60 truncate">
                        {slide.price ? naira(slide.price) : slide.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar with Arrows & Progress Line */}
          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            {/* Real-time progress bar for autoplay */}
            <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    className={`h-2 transition-all rounded-full ${
                      idx === currentIndex
                        ? "w-8 bg-amber-400"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
