import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Calendar,
  MessageSquare,
  Bed,
  Utensils,
  GlassWater,
  PartyPopper,
  Building2,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { whatsappLink, naira } from "@/lib/hotel";

// Image imports from existing assets
import hotelLobby from "@/assets/Hotel Lobby.jpg";
import reception from "@/assets/Reception.jpg";
import reception1 from "@/assets/Reception1.jpg";
import signatureSuite from "@/assets/Signature Suite.jpg";
import diplomaticSuite from "@/assets/Diplomatic Suite.jpg";
import superExecutive from "@/assets/Super Executive.jpg";
import executiveSuite from "@/assets/Executive Suite.jpg";
import standardPlus from "@/assets/Standard Plus.jpg";
import duluxe from "@/assets/Duluxe.jpg";
import standardRoom from "@/assets/Standard room.jpg";
import suite1 from "@/assets/Suite1.jpg";
import restaurant2 from "@/assets/Restaurant 2.jpg";
import ballardTable from "@/assets/Ballard Table.jpg";
import openBarGarden from "@/assets/OpenBar Garden.jpg";
import openBarGarden2 from "@/assets/OpenBar Garden 2.jpg";
import openBarGarden3 from "@/assets/OpenBar Garden 3.jpg";
import openBarSitout from "@/assets/OpenBar sitout.jpg";
import openAirBarSitout from "@/assets/open air bar sitout.jpg";
import bankyHall from "@/assets/BankyHall.jpg";
import hotelSideHall2 from "@/assets/hotel side hall 2.jpg";
import hotelSideHall3 from "@/assets/hotel side hall 3.jpg";
import leftsideHotelFront from "@/assets/leftside hotel front.jpg";
import rightsideHotelFront from "@/assets/rightside hotel front.jpg";
import heroExterior from "@/assets/hero-exterior.jpg";

export type GalleryCategory = "all" | "interior" | "amenities" | "dining" | "events" | "exterior";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  categoryLabel: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  tall?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "signature-suite",
    src: signatureSuite,
    alt: "Signature Suite master bedroom and interior lounge",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Signature Suite Residence",
    tagline: "Our premier architectural suite with separate parlor and marble bath",
    description:
      "Spanning 78 square meters, the Signature Suite exemplifies calm luxury with custom timber millwork, floor-to-ceiling sound-insulated glass, a master bedroom with plush king bedding, and a private dressing salon.",
    highlights: [
      "78 sqm living space",
      "Separate VIP parlor",
      "Rainfall marble shower",
      "Complimentary breakfast",
    ],
    tall: true,
    actionUrl: "/reserve?room=signature-suite",
    actionLabel: "Reserve Signature Suite",
  },
  {
    id: "hotel-lobby",
    src: hotelLobby,
    alt: "Grand hotel lobby with polished marble and frosted glass",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "The Grand Lobby & Atrium",
    tagline: "High-ceiling architectural arrival hall bathed in natural light",
    description:
      "A serene welcome sanctuary crafted with imported polished marble floors, acoustic frosted glass screens, warm architectural ambient lighting, and bespoke seating for arriving guests.",
    highlights: [
      "Acoustic frosted glass",
      "Italian marble flooring",
      "Quiet check-in lounge",
      "24/7 front desk",
    ],
    tall: false,
  },
  {
    id: "restaurant-2",
    src: restaurant2,
    alt: "Restaurant 2 dining hall with elegant table settings",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Restaurant 2 Fine Dining",
    tagline: "Authentic Nigerian gastronomy & continental culinary classics",
    description:
      "Featuring an open-view kitchen led by executive chefs preparing celebrated Ekiti delicacies, freshly pounded yam with egusi, grilled croaker, and continental breakfast buffets.",
    highlights: [
      "Chef-prepared dishes",
      "Breakfast 7:00am - 10:30am",
      "Private dining available",
      "Room service delivery",
    ],
    tall: true,
    actionUrl: "/dining",
    actionLabel: "View Dining Menu",
  },
  {
    id: "open-bar-garden",
    src: openBarGarden,
    alt: "Open-Air Bar Garden with lush trees and twilight lighting",
    category: "amenities",
    categoryLabel: "Amenities & Recreation",
    title: "Open-Air Bar Garden",
    tagline: "Lush outdoor garden lounge under Ado-Ekiti open skies",
    description:
      "Surrounded by manicured garden foliage and string illumination, the bar garden offers chilled draught beers, imported whiskies, craft cocktails, and fresh open-flame barbecue skewers.",
    highlights: [
      "Craft cocktail bar",
      "Live acoustic evenings",
      "Open-flame grill",
      "Outdoor table service",
    ],
    tall: true,
    actionUrl: "/dining",
    actionLabel: "Explore Bar Garden",
  },
  {
    id: "diplomatic-suite",
    src: diplomaticSuite,
    alt: "Diplomatic Suite luxury bedroom and executive desk",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Diplomatic Suite",
    tagline: "Engineered for corporate dignitaries and state delegates",
    description:
      "A composed retreat with 56 sqm of space, ergonomic executive workspace, high-speed fibre optic connectivity, discreet in-room dining setup, and sound-damped sleeping quarters.",
    highlights: [
      "56 sqm executive layout",
      "Ergonomic work desk",
      "Fibre-optic Wi-Fi",
      "VIP room service",
    ],
    tall: false,
    actionUrl: "/reserve?room=diplomatic-suite",
    actionLabel: "Book Diplomatic Suite",
  },
  {
    id: "banky-hall",
    src: bankyHall,
    alt: "Banky Hall main event and conference center",
    category: "events",
    categoryLabel: "Event Spaces",
    title: "Banky Hall & Conference Center",
    tagline: "State-of-the-art ballroom accommodating up to 300 guests",
    description:
      "Fully air-conditioned multipurpose banquet hall outfitted with crystal chandeliers, acoustic wall panelling, executive stage, crystal audio sound systems, and dedicated catering wing.",
    highlights: [
      "300 guest capacity",
      "Crystal chandelier lighting",
      "Full multimedia stage",
      "Dedicated banquet team",
    ],
    tall: true,
    actionUrl: "/events",
    actionLabel: "Plan an Event",
  },
  {
    id: "ballard-lounge",
    src: ballardTable,
    alt: "Ballard and billiard table in guest recreation lounge",
    category: "amenities",
    categoryLabel: "Amenities & Recreation",
    title: "Billiard & Ballard Lounge",
    tagline: "Tournament-grade recreation tables for guest relaxation",
    description:
      "A dedicated entertainment space featuring tournament-grade Ballard and pool tables, sports television broadcasts, and dedicated cocktail service for guests unwinding after meetings.",
    highlights: [
      "Tournament billiard tables",
      "Live sports screens",
      "Beverage service",
      "Open daily till midnight",
    ],
    tall: false,
  },
  {
    id: "reception-desk",
    src: reception,
    alt: "Concierge reception desk with professional staff",
    category: "amenities",
    categoryLabel: "Amenities & Recreation",
    title: "24/7 Concierge & Front Desk",
    tagline: "Attentive hospitality and city orientation around the clock",
    description:
      "Our reception team manages automated digital check-ins, chauffeured airport transfers to Akure Airport, local sightseeing reservations to Ikogosi Warm Springs, and laundry services.",
    highlights: [
      "24/7 front desk check-in",
      "Airport shuttle booking",
      "Luggage holding service",
      "Ekiti tourism assistance",
    ],
    tall: true,
  },
  {
    id: "super-executive",
    src: superExecutive,
    alt: "Super Executive suite with reading corner and smart entertainment",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Super Executive Room",
    tagline: "Spacious comfort with curated modern artworks",
    description:
      "Generously proportioned at 42 sqm, featuring a cozy armchair reading nook, 4K smart television with satellite channels, bedside USB charging ports, and rainfall ensuite bath.",
    highlights: [
      "42 sqm layout",
      "Reading corner armchair",
      "Smart 4K television",
      "Premium memory-foam bed",
    ],
    tall: false,
    actionUrl: "/reserve?room=super-executive",
    actionLabel: "Reserve Super Executive",
  },
  {
    id: "openbar-garden-2",
    src: openBarGarden2,
    alt: "Twilight ambience at the open-air bar terrace",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Garden Terrace at Twilight",
    tagline: "Warm lighting and cool highland breeze in the evening",
    description:
      "When the sun sets over Ekiti's rolling hills, the garden terrace transforms into an intimate open-sky cocktail destination with ambient music and handcrafted signature drinks.",
    highlights: [
      "Signature cocktails",
      "Comfortable lounge seating",
      "Evening cool breeze",
      "Private tables available",
    ],
    tall: true,
  },
  {
    id: "executive-suite",
    src: executiveSuite,
    alt: "Executive room with crisp white linen and work desk",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Executive Room",
    tagline: "Warm timber accents and silent climate control",
    description:
      "Engineered for sound rest and productivity. Offers double-glazed acoustic windows, whisper-quiet air conditioning, plush Egyptian cotton linens, and a dedicated writing desk.",
    highlights: [
      "36 sqm space",
      "Acoustic noise isolation",
      "High-speed fibre Wi-Fi",
      "En-suite rain shower",
    ],
    tall: true,
    actionUrl: "/reserve?room=executive",
    actionLabel: "Reserve Executive",
  },
  {
    id: "side-hall-breakout",
    src: hotelSideHall2,
    alt: "Executive side hall seminar and meeting space",
    category: "events",
    categoryLabel: "Event Spaces",
    title: "Executive Side Hall & Seminar Suite",
    tagline: "Tailored breakout room for corporate board meetings & AGMs",
    description:
      "Equipped with projection facilities, conference seating configurations, and dedicated coffee breaks, this versatile hall accommodates 30 to 80 delegates seamlessly.",
    highlights: [
      "30-80 delegate capacity",
      "Audio-visual equipment",
      "Dedicated catering bar",
      "Climate controlled",
    ],
    tall: false,
    actionUrl: "/events",
    actionLabel: "Enquire for Meetings",
  },
  {
    id: "deluxe-room",
    src: duluxe,
    alt: "Deluxe accommodation with warm ambient lighting",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Deluxe Room",
    tagline: "Understated elegance with garden views",
    description:
      "Bright 32 sqm room with soft neutral tones, custom built-in wardrobe, mini-refrigerator, tea and coffee maker, and pristine tiled shower enclosure.",
    highlights: [
      "32 sqm layout",
      "Garden view windows",
      "Tea & coffee station",
      "Daily turndown service",
    ],
    tall: false,
    actionUrl: "/reserve?room=deluxe",
    actionLabel: "Reserve Deluxe",
  },
  {
    id: "openbar-sitout",
    src: openBarSitout,
    alt: "Open-air bar sit-out tables and parasols",
    category: "amenities",
    categoryLabel: "Amenities & Recreation",
    title: "Outdoor Patio & Sit-Out",
    tagline: "Casual alfresco seating for daytime drinks and snacks",
    description:
      "Shaded outdoor patio tables perfect for catching up with friends over chilled drinks, afternoon pepper soup, and casual evening conversations.",
    highlights: [
      "Shaded parasol seating",
      "Quick drink & snack service",
      "Garden breeze",
      "Casual dress code",
    ],
    tall: false,
  },
  {
    id: "hotel-exterior-front",
    src: heroExterior,
    alt: "Banky Hotel & Suites front facade at golden hour",
    category: "exterior",
    categoryLabel: "Property & Grounds",
    title: "Banky Hotel Main Facade",
    tagline: "Modern glass and architectural presence in Ado-Ekiti",
    description:
      "A striking multi-story boutique property designed with reflective bronze glass, private balconies, and landscaped entrance driveways.",
    highlights: [
      "Secure perimeter wall",
      "24/7 armed security",
      "Paved guest parking",
      "Central Ado-Ekiti location",
    ],
    tall: true,
  },
  {
    id: "reception-lounge",
    src: reception1,
    alt: "Reception arrival lounge with armchairs",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Arrival Lounge & Waiting Suite",
    tagline: "Plush armchairs and welcome beverages upon arrival",
    description:
      "Guests enjoy a relaxing transition from transit to their suites with chilled towel service, refreshing welcome drinks, and swift keycard issuance.",
    highlights: [
      "Complimentary welcome drinks",
      "Luggage assistance",
      "Express check-in/out",
      "Air-conditioned lounge",
    ],
    tall: false,
  },
  {
    id: "side-hall-banquet",
    src: hotelSideHall3,
    alt: "Hotel side hall arranged for banquet dining",
    category: "events",
    categoryLabel: "Event Spaces",
    title: "Banquet & Dining Wing",
    tagline: "Direct connection from main hall to dining stations",
    description:
      "Provides seamless catering flow for weddings and large conferences, ensuring guests can transition smoothly from presentations to dining.",
    highlights: [
      "Buffet line setups",
      "Direct kitchen access",
      "Seamless event flow",
      "Dedicated steward service",
    ],
    tall: false,
  },
  {
    id: "standard-plus",
    src: standardPlus,
    alt: "Standard Plus room with extended seating",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Standard Plus Room",
    tagline: "Smart simplicity with added lounge comfort",
    description:
      "A 34 sqm accommodation combining a comfortable queen-size bed, writing desk, flat-panel TV, and en-suite bath for solo business or leisure stays.",
    highlights: ["34 sqm space", "Queen size bed", "Flat-screen TV", "High-speed Wi-Fi"],
    tall: false,
    actionUrl: "/reserve?room=standard-plus",
    actionLabel: "Reserve Standard Plus",
  },
  {
    id: "openbar-garden-3",
    src: openBarGarden3,
    alt: "Cocktail garden landscape with night lighting",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Open-Air Cocktail Garden",
    tagline: "The heartbeat of Ado-Ekiti evening leisure",
    description:
      "A vibrant yet sophisticated nightlife destination for hotel guests and local patrons alike, offering fine spirits and monthly live music.",
    highlights: [
      "Curated spirit selection",
      "Monthly karaoke & live bands",
      "Suya & grill station",
      "Secure on-site parking",
    ],
    tall: true,
  },
  {
    id: "suite-1-studio",
    src: suite1,
    alt: "Studio suite accommodation with kitchenette nook",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Studio Suite",
    tagline: "Self-contained layout ideal for extended stays",
    description:
      "Designed for guests staying several days or weeks in Ado-Ekiti, featuring comfortable sleeping quarters, mini-kitchenette amenities, and ample wardrobe storage.",
    highlights: [
      "30 sqm self-contained suite",
      "Extended stay amenities",
      "Dedicated workspace",
      "Weekly laundry discounts",
    ],
    tall: false,
    actionUrl: "/reserve?room=studio",
    actionLabel: "Reserve Studio Suite",
  },
  {
    id: "leftside-hotel",
    src: leftsideHotelFront,
    alt: "West wing architectural view of Banky Hotel",
    category: "exterior",
    categoryLabel: "Property & Grounds",
    title: "West Wing Architecture",
    tagline: "Geometric lines and continuous uninterrupted power infrastructure",
    description:
      "Demonstrating Banky Hotel's dedicated power substation and solar backups, ensuring 24/7 continuous air conditioning and lightning-fast Wi-Fi.",
    highlights: [
      "100% 24/7 generator backup",
      "Solar emergency lighting",
      "Sound-insulated exterior",
      "Gated compound",
    ],
    tall: false,
  },
  {
    id: "open-air-bar-sitout",
    src: openAirBarSitout,
    alt: "Evening open-air bar sitout tables",
    category: "amenities",
    categoryLabel: "Amenities & Recreation",
    title: "Open Sky Sit-Out Lounge",
    tagline: "Relaxed ambiance under tropical starlight",
    description:
      "Enjoy late-night conversations with fresh drinks and grill options served directly to your table in a breezy, open-air garden atmosphere.",
    highlights: [
      "Full bar service",
      "Open till late",
      "Comfortable cushioned chairs",
      "Ambient outdoor lighting",
    ],
    tall: false,
  },
  {
    id: "standard-room",
    src: standardRoom,
    alt: "Standard room with clean linen and en-suite bath",
    category: "interior",
    categoryLabel: "Interior Design",
    title: "Standard Room",
    tagline: "Impeccable boutique comfort starting from ₦30,000 / night",
    description:
      "Our most accessible category, providing all the quintessential Banky comforts: pristine bedding, silent air conditioning, Wi-Fi, and rainfall shower.",
    highlights: [
      "28 sqm efficient layout",
      "Starting from ₦30,000/night",
      "Complimentary Wi-Fi",
      "24/7 room service",
    ],
    tall: false,
    actionUrl: "/reserve?room=standard",
    actionLabel: "Reserve Standard Room",
  },
  {
    id: "rightside-hotel",
    src: rightsideHotelFront,
    alt: "East wing grounds and secure entry gate",
    category: "exterior",
    categoryLabel: "Property & Grounds",
    title: "East Wing & Secure Entrance",
    tagline: "Round-the-clock guarded security for total peace of mind",
    description:
      "Monitored by full-perimeter CCTV surveillance and professional uniformed security personnel, ensuring a tranquil and safe sanctuary for every guest.",
    highlights: [
      "24/7 CCTV surveillance",
      "Armed security personnel",
      "Controlled gated entry",
      "Secure valet parking",
    ],
    tall: false,
  },
];

interface MasonryGalleryProps {
  initialCategory?: GalleryCategory;
  showFilters?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function MasonryGallery({
  initialCategory = "all",
  showFilters = true,
  limit,
  title,
  subtitle,
}: MasonryGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>(initialCategory);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Filter items based on active category
  const filteredItems = (
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory)
  ).slice(0, limit ?? GALLERY_ITEMS.length);

  const selectedItem: GalleryItem | null =
    selectedImageIndex !== null ? (filteredItems[selectedImageIndex] ?? null) : null;

  // Handle navigation in lightbox
  const handlePrev = useCallback(() => {
    if (selectedImageIndex === null) return;
    setIsZoomed(false);
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : 0,
    );
  }, [selectedImageIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (selectedImageIndex === null) return;
    setIsZoomed(false);
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : 0,
    );
  }, [selectedImageIndex, filteredItems.length]);

  const handleClose = useCallback(() => {
    setSelectedImageIndex(null);
    setIsZoomed(false);
  }, []);

  // Keyboard navigation event listeners
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImageIndex, handleClose, handlePrev, handleNext]);

  const CATEGORIES: { id: GalleryCategory; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All Highlights", icon: Layers },
    { id: "interior", label: "Interior & Suites", icon: Bed },
    { id: "amenities", label: "Amenities & Recreation", icon: GlassWater },
    { id: "dining", label: "Dining & Bar Garden", icon: Utensils },
    { id: "events", label: "Banky Hall & Events", icon: PartyPopper },
    { id: "exterior", label: "Property & Grounds", icon: Building2 },
  ];

  return (
    <div className="w-full">
      {/* Optional Header Section */}
      {(title || subtitle) && (
        <div className="mb-10 text-center sm:text-left">
          {subtitle && (
            <span className="eyebrow text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {subtitle}
            </span>
          )}
          {title && <h2 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h2>}
        </div>
      )}

      {/* Category Navigation Pills */}
      {showFilters && (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Showing {filteredItems.length} curated spaces</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`gallery-filter-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedImageIndex(null);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "border border-border/80 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Masonry Grid Columns Layout */}
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            id={`gallery-thumb-${item.id}`}
            onClick={() => setSelectedImageIndex(index)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl break-inside-avoid"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedImageIndex(index);
              }
            }}
            aria-label={`View photo of ${item.title}`}
          >
            {/* Image Container */}
            <div className="relative overflow-hidden">
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                width={800}
                height={600}
                className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                  item.tall ? "h-[460px]" : "h-[290px]"
                }`}
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

              {/* Category Pill on top-left */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[0.62rem] font-semibold tracking-widest uppercase text-white/90 backdrop-blur-md">
                  {item.categoryLabel}
                </span>
              </div>

              {/* Expand Icon on top-right */}
              <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
              </div>

              {/* Card Footer Content (Always readable on dark scrim) */}
              <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-black/60 p-4 text-white backdrop-blur-md transition-all duration-300">
                <h3 className="font-display text-lg leading-tight text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {item.tagline}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[0.68rem] tracking-wider uppercase text-amber-300/90 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Click to explore details
                  </span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Lightbox Modal */}
      {selectedItem && selectedImageIndex !== null && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl transition-opacity duration-300 animate-in fade-in"
          onClick={handleClose}
        >
          {/* Top Control Bar */}
          <div
            className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                {selectedItem.categoryLabel}
              </span>
              <span className="text-xs text-white/60">
                {selectedImageIndex + 1} of {filteredItems.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="lightbox-zoom-btn"
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                title={isZoomed ? "Zoom out" : "Zoom in"}
                aria-label="Toggle zoom"
              >
                {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                id="lightbox-close-btn"
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-red-500/80 hover:border-red-500 transition-colors"
                title="Close Lightbox (Esc)"
                aria-label="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            id="lightbox-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 z-40 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            id="lightbox-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 z-40 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
            aria-label="Next photograph"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Main Lightbox Body (Image & Story Card) */}
          <div
            className="relative z-30 mx-auto flex h-full max-h-[90vh] w-full max-w-7xl flex-col lg:flex-row items-center justify-center gap-6 p-4 sm:p-8 pt-16 pb-24 overflow-y-auto lg:overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview Container */}
            <div className="relative flex max-h-[60vh] lg:max-h-[80vh] w-full lg:w-3/5 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
              <img
                src={selectedItem.src}
                alt={selectedItem.alt}
                className={`max-h-[60vh] lg:max-h-[80vh] w-full object-contain transition-all duration-300 ${
                  isZoomed ? "scale-125 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Information Card & Booking Actions */}
            <div className="w-full lg:w-2/5 rounded-2xl border border-white/15 bg-black/75 p-6 sm:p-8 text-white backdrop-blur-2xl shadow-2xl">
              <span className="eyebrow text-amber-300 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {selectedItem.categoryLabel}
              </span>

              <h2 className="mt-2 font-display text-2xl sm:text-3xl text-white">
                {selectedItem.title}
              </h2>
              <p className="mt-2 text-sm text-amber-200/90 font-medium">{selectedItem.tagline}</p>

              <p className="mt-4 text-sm leading-relaxed text-white/80 font-light border-t border-white/10 pt-4">
                {selectedItem.description}
              </p>

              {/* Highlights Checklist */}
              {selectedItem.highlights.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <span className="text-[0.68rem] tracking-widest uppercase text-white/60 font-semibold block mb-3">
                    Key Features & Amenities
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/90">
                    {selectedItem.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                {selectedItem.actionUrl && (
                  <Link
                    to={selectedItem.actionUrl}
                    id="lightbox-primary-action"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wider uppercase text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{selectedItem.actionLabel ?? "Reserve Online"}</span>
                  </Link>
                )}
                <a
                  href={whatsappLink(
                    `Hello Banky Hotel & Suites, I am inquiring about ${selectedItem.title}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  id="lightbox-whatsapp-action"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Ask Front Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Filmstrip */}
          <div
            className="absolute bottom-2 inset-x-0 z-40 hidden sm:flex items-center justify-center gap-2 overflow-x-auto px-4 py-2 bg-gradient-to-t from-black/90 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredItems.map((thumb, idx) => (
              <button
                key={thumb.id}
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setSelectedImageIndex(idx);
                }}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                  idx === selectedImageIndex
                    ? "border-amber-400 scale-110 ring-2 ring-amber-400/50"
                    : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={thumb.src} alt={thumb.title} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
