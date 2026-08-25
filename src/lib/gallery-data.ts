// All 33 images imported directly from the repository assets
import signatureSuite from "@/assets/Signature Suite.jpg";
import diplomaticSuite from "@/assets/Diplomatic Suite.jpg";
import superExecutive from "@/assets/Super Executive.jpg";
import executiveSuite from "@/assets/Executive Suite.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import duluxe from "@/assets/Duluxe.jpg";
import standardPlus from "@/assets/Standard Plus.jpg";
import suite1 from "@/assets/Suite1.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomStandard from "@/assets/room-standard.jpg";
import standardRoom from "@/assets/Standard room.jpg";

import hotelLobby from "@/assets/Hotel Lobby.jpg";
import lobby from "@/assets/lobby.jpg";
import reception from "@/assets/Reception.jpg";
import reception1 from "@/assets/Reception1.jpg";
import lounge from "@/assets/lounge.jpg";
import lounge1 from "@/assets/lounge1.jpg";
import ballardTable from "@/assets/Ballard Table.jpg";

import restaurant2 from "@/assets/Restaurant 2.jpg";
import dining from "@/assets/dining.jpg";
import openBarGarden from "@/assets/OpenBar Garden.jpg";
import openBarGarden2 from "@/assets/OpenBar Garden 2.jpg";
import openBarGarden3 from "@/assets/OpenBar Garden 3.jpg";
import openBarSitout from "@/assets/OpenBar sitout.jpg";
import openAirBarSitout from "@/assets/open air bar sitout.jpg";

import bankyHall from "@/assets/BankyHall.jpg";
import events from "@/assets/events.jpg";
import hotelSideHall2 from "@/assets/hotel side hall 2.jpg";
import hotelSideHall3 from "@/assets/hotel side hall 3.jpg";

import heroExterior from "@/assets/hero-exterior.jpg";
import hero from "@/assets/hero.jpg";
import leftsideHotelFront from "@/assets/leftside hotel front.jpg";
import rightsideHotelFront from "@/assets/rightside hotel front.jpg";

export type GalleryCategory = "all" | "rooms" | "dining" | "amenities" | "events" | "exterior";

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
  specs?: {
    size?: string;
    capacity?: string;
    rate?: string;
    view?: string;
  };
  tall?: boolean;
  featured?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const GALLERY_CATEGORIES: {
  id: GalleryCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "All Spaces",
    description: "Complete architectural and amenities collection",
  },
  {
    id: "rooms",
    label: "Suites & Rooms",
    description: "Luxury accommodations and bedrooms",
  },
  {
    id: "dining",
    label: "Dining & Bar Garden",
    description: "Restaurant 2, open-air garden, and cocktail bars",
  },
  {
    id: "amenities",
    label: "Amenities & Lounges",
    description: "Concierge, VIP lounges, Ballard and recreation",
  },
  {
    id: "events",
    label: "Halls & Banquets",
    description: "Banky Hall, seminar spaces, and gala venues",
  },
  {
    id: "exterior",
    label: "Grounds & Facade",
    description: "Architecture, gates, security, and landscape",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  // 1. Signature Suite
  {
    id: "signature-suite",
    src: signatureSuite,
    alt: "Signature Suite master bedroom and executive living parlor",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Signature Suite Residence",
    tagline: "Our premier VIP architectural suite with separate parlor & marble bath",
    description:
      "Spanning 78 square meters, the Signature Suite exemplifies calm luxury with custom timber millwork, floor-to-ceiling sound-insulated glass, a master bedroom with plush king bedding, and a private dressing salon.",
    highlights: [
      "78 sqm private residence",
      "Separate VIP parlor",
      "Rainfall marble shower",
      "Complimentary breakfast for two",
    ],
    specs: {
      size: "78 sqm",
      capacity: "2 Guests",
      rate: "₦150,000 / night",
      view: "Panoramic City & Garden",
    },
    tall: true,
    featured: true,
    actionUrl: "/reserve?room=signature-suite",
    actionLabel: "Reserve Signature Suite",
  },

  // 2. Diplomatic Suite
  {
    id: "diplomatic-suite",
    src: diplomaticSuite,
    alt: "Diplomatic Suite luxury bedroom and executive workstation",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Diplomatic Presidential Suite",
    tagline: "Engineered for corporate dignitaries, visiting ministers, and state delegates",
    description:
      "A composed retreat with 56 sqm of space, ergonomic executive workspace, high-speed fibre optic connectivity, discreet in-room dining setup, and sound-damped sleeping quarters.",
    highlights: [
      "56 sqm executive layout",
      "Ergonomic work desk",
      "Fibre-optic Wi-Fi",
      "VIP late checkout",
    ],
    specs: {
      size: "56 sqm",
      capacity: "2 Guests",
      rate: "₦75,000 / night",
      view: "Private Garden View",
    },
    tall: false,
    featured: true,
    actionUrl: "/reserve?room=diplomatic-suite",
    actionLabel: "Reserve Diplomatic Suite",
  },

  // 3. Super Executive
  {
    id: "super-executive",
    src: superExecutive,
    alt: "Super Executive suite with curated art and reading armchair nook",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Super Executive Room",
    tagline: "Generous daylight, bespoke lounge seating, and curated modern art",
    description:
      "Generously proportioned at 42 sqm, featuring a cozy armchair reading nook, 4K smart television with satellite channels, bedside USB charging ports, and rainfall ensuite bath.",
    highlights: [
      "42 sqm layout",
      "Reading corner armchair",
      "Smart 4K television",
      "Memory-foam king bed",
    ],
    specs: {
      size: "42 sqm",
      capacity: "2 Guests",
      rate: "₦55,000 / night",
      view: "Courtyard View",
    },
    tall: false,
    actionUrl: "/reserve?room=super-executive",
    actionLabel: "Reserve Super Executive",
  },

  // 4. Executive Suite
  {
    id: "executive-suite",
    src: executiveSuite,
    alt: "Executive room with crisp white linen and work desk",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Executive Room (Classic Wing)",
    tagline: "Warm timber accents, double-glazed soundproofing & silent climate control",
    description:
      "Engineered for sound rest and productivity. Offers double-glazed acoustic windows, whisper-quiet air conditioning, plush Egyptian cotton linens, and a dedicated writing desk.",
    highlights: [
      "36 sqm space",
      "Acoustic noise isolation",
      "High-speed fibre Wi-Fi",
      "En-suite rain shower",
    ],
    specs: {
      size: "36 sqm",
      capacity: "2 Guests",
      rate: "₦45,000 / night",
      view: "Quiet Courtyard",
    },
    tall: true,
    actionUrl: "/reserve?room=executive",
    actionLabel: "Reserve Executive",
  },

  // 5. Room Executive Modern
  {
    id: "room-executive",
    src: roomExecutive,
    alt: "Contemporary Executive room styling with ambient bedside lamps",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Executive Room (West Wing)",
    tagline: "Contemporary styling with warm ambient backlighting and plush bedding",
    description:
      "Designed with soft neutral tones, premium hardwood furnishings, and silent multi-split inverter cooling for maximum comfort during business or leisure trips.",
    highlights: [
      "Plush king mattress",
      "Ambient architectural lighting",
      "Full ensuite vanity",
      "In-room mini refreshment bar",
    ],
    specs: {
      size: "36 sqm",
      capacity: "2 Guests",
      rate: "₦45,000 / night",
      view: "Hotel Grounds",
    },
    tall: false,
    actionUrl: "/reserve?room=executive",
    actionLabel: "Reserve Executive",
  },

  // 6. Deluxe Room
  {
    id: "deluxe-room",
    src: duluxe,
    alt: "Deluxe accommodation with warm ambient lighting and garden view",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Deluxe Room",
    tagline: "Understated elegance with garden views and refreshing morning sun",
    description:
      "Bright 32 sqm room with soft neutral tones, custom built-in wardrobe, mini-refrigerator, tea and coffee maker, and pristine tiled shower enclosure.",
    highlights: [
      "32 sqm layout",
      "Garden view windows",
      "Tea & coffee station",
      "Daily turndown service",
    ],
    specs: {
      size: "32 sqm",
      capacity: "2 Guests",
      rate: "₦40,000 / night",
      view: "Garden Landscape",
    },
    tall: false,
    actionUrl: "/reserve?room=deluxe",
    actionLabel: "Reserve Deluxe",
  },

  // 7. Standard Plus
  {
    id: "standard-plus",
    src: standardPlus,
    alt: "Standard Plus room with extended seating and queen bed",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Standard Plus Room",
    tagline: "Smart simplicity with added lounge comfort and workspace",
    description:
      "A 34 sqm accommodation combining a comfortable queen-size bed, writing desk, flat-panel TV, and en-suite bath for solo business or leisure stays.",
    highlights: ["34 sqm space", "Queen size bed", "Flat-screen TV", "High-speed Wi-Fi"],
    specs: {
      size: "34 sqm",
      capacity: "2 Guests",
      rate: "₦45,000 / night",
      view: "Courtyard",
    },
    tall: false,
    actionUrl: "/reserve?room=standard-plus",
    actionLabel: "Reserve Standard Plus",
  },

  // 8. Studio Suite
  {
    id: "suite-1-studio",
    src: suite1,
    alt: "Studio suite accommodation with kitchenette nook",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Studio Suite & Extended Stay",
    tagline: "Self-contained layout ideal for extended visits to Ekiti State",
    description:
      "Designed for guests staying several days or weeks in Ado-Ekiti, featuring comfortable sleeping quarters, mini-kitchenette amenities, and ample wardrobe storage.",
    highlights: [
      "30 sqm self-contained suite",
      "Extended stay amenities",
      "Dedicated workspace",
      "Weekly laundry service",
    ],
    specs: {
      size: "30 sqm",
      capacity: "2 Guests",
      rate: "₦35,000 / night",
      view: "Boutique Wing",
    },
    tall: false,
    actionUrl: "/reserve?room=studio",
    actionLabel: "Reserve Studio Suite",
  },

  // 9. Luxury Suite Bedroom View
  {
    id: "room-suite-interior",
    src: roomSuite,
    alt: "Luxury penthouse suite bed dressed in crisp white hotel linens",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Penthouse Suite Interior",
    tagline: "Ultra-plush bedding and bespoke mahogany headboard",
    description:
      "Each bed is dressed in high-thread-count Egyptian cotton linens, feather-soft pillows, and orthopedic mattresses designed for deep restorative sleep.",
    highlights: [
      "Egyptian cotton linens",
      "Orthopedic mattress",
      "Acoustic isolation",
      "Bedside power & USB",
    ],
    specs: {
      size: "50 sqm",
      capacity: "2 Guests",
      rate: "₦65,000 / night",
      view: "Upper Level",
    },
    tall: true,
  },

  // 10. Classic Standard Room
  {
    id: "room-standard-classic",
    src: roomStandard,
    alt: "Standard room contemporary interior with comfortable double bed",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Classic Standard Room",
    tagline: "Boutique hospitality essentials at an accessible direct rate",
    description:
      "Offering full climate control, high-speed fibre Wi-Fi, television entertainment, hot shower water, and 24/7 room service.",
    highlights: [
      "Starting at ₦30,000 / night",
      "Private bathroom",
      "Satellite television",
      "24/7 room service",
    ],
    specs: {
      size: "28 sqm",
      capacity: "2 Guests",
      rate: "₦30,000 / night",
      view: "Quiet Wing",
    },
    tall: false,
    actionUrl: "/reserve?room=standard",
    actionLabel: "Reserve Standard Room",
  },

  // 11. Standard Room
  {
    id: "standard-room",
    src: standardRoom,
    alt: "Standard room with clean linen and en-suite bath",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    title: "Standard Room (East Wing)",
    tagline: "Impeccable boutique comfort starting from ₦30,000 / night",
    description:
      "Our most accessible category, providing all the quintessential Banky comforts: pristine bedding, silent air conditioning, Wi-Fi, and rainfall shower.",
    highlights: [
      "28 sqm efficient layout",
      "Starting from ₦30,000/night",
      "Complimentary Wi-Fi",
      "24/7 room service",
    ],
    specs: {
      size: "28 sqm",
      capacity: "2 Guests",
      rate: "₦30,000 / night",
      view: "City View",
    },
    tall: false,
    actionUrl: "/reserve?room=standard",
    actionLabel: "Reserve Standard Room",
  },

  // 12. Hotel Lobby
  {
    id: "hotel-lobby",
    src: hotelLobby,
    alt: "Grand hotel lobby with polished Italian marble and frosted glass architecture",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
    title: "The Grand Lobby & Atrium",
    tagline: "High-ceiling architectural arrival hall bathed in natural daylight",
    description:
      "A serene welcome sanctuary crafted with imported polished marble floors, acoustic frosted glass screens, warm architectural ambient lighting, and bespoke seating for arriving guests.",
    highlights: [
      "Acoustic frosted glass",
      "Italian marble flooring",
      "Quiet check-in lounge",
      "24/7 concierge service",
    ],
    specs: {
      size: "180 sqm",
      capacity: "50 Guests",
      rate: "Complimentary for Guests",
      view: "Central Atrium",
    },
    tall: true,
    featured: true,
  },

  // 13. Main Lobby
  {
    id: "lobby-main",
    src: lobby,
    alt: "Main hospitality lobby with reception seating",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
    title: "Hospitality Lounge & Atrium",
    tagline: "Spacious reception lounge with comfortable seating and complimentary Wi-Fi",
    description:
      "An inviting central meeting point for hotel guests, business colleagues, and visitors enjoying tea or quiet conversations.",
    highlights: [
      "Complimentary high-speed Wi-Fi",
      "Central air conditioning",
      "Concierge assistance",
      "Comfortable armchair seating",
    ],
    tall: false,
  },

  // 14. Reception Desk
  {
    id: "reception-desk",
    src: reception,
    alt: "Concierge reception desk with professional front desk staff",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
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

  // 15. Reception Arrival Lounge
  {
    id: "reception-lounge",
    src: reception1,
    alt: "Reception arrival lounge with armchairs",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
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

  // 16. VIP Lounge
  {
    id: "lounge-vip",
    src: lounge,
    alt: "Executive VIP lounge with premium leather seating and beverage bar",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
    title: "Executive VIP Lounge",
    tagline: "Private sanctuary for dignitaries and suite guests",
    description:
      "A quiet, private club setting offering premium coffee, fresh fruit, vintage spirits, and daily newspapers away from the public areas.",
    highlights: [
      "Exclusive suite guest access",
      "Beverage & coffee station",
      "Intimate seating booths",
      "Sound-damped atmosphere",
    ],
    tall: false,
    featured: true,
  },

  // 17. Club Lounge
  {
    id: "lounge-club",
    src: lounge1,
    alt: "Intimate conversation lounge with warm ambient lighting",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
    title: "Private Club Lounge",
    tagline: "Intimate conversation nook with warm ambient lighting",
    description:
      "Designed for private business meetings, executive discussions, or quiet late-afternoon reading.",
    highlights: [
      "High privacy setting",
      "Dedicated steward service",
      "Soft acoustic background music",
      "Air conditioned",
    ],
    tall: false,
  },

  // 18. Ballard & Billiard Lounge
  {
    id: "ballard-lounge",
    src: ballardTable,
    alt: "Ballard and billiard table in guest recreation lounge",
    category: "amenities",
    categoryLabel: "Amenities & Lounges",
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
    featured: true,
  },

  // 19. Restaurant 2
  {
    id: "restaurant-2",
    src: restaurant2,
    alt: "Restaurant 2 dining hall with elegant table settings and fine cutlery",
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
    specs: {
      capacity: "80 Guests",
      rate: "Breakfast Included with Suites",
      view: "Garden Dining Area",
    },
    tall: true,
    featured: true,
    actionUrl: "/dining",
    actionLabel: "View Dining Menu",
  },

  // 20. Gourmet Dining
  {
    id: "dining-gourmet",
    src: dining,
    alt: "Gourmet Nigerian culinary dishes plated with precision",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Ekiti & Continental Cuisine",
    tagline: "Farm-to-table freshness prepared with traditional Nigerian culinary craft",
    description:
      "Every dish is crafted with locally sourced fresh Ekiti produce, organic poultry, and choice cuts, paired with an extensive wine and spirits list.",
    highlights: [
      "Ekiti local specialties",
      "Fresh daily produce",
      "A la carte & buffet options",
      "Dietary accommodations",
    ],
    tall: false,
    actionUrl: "/dining",
    actionLabel: "Explore Food & Wine",
  },

  // 21. Open-Air Bar Garden
  {
    id: "open-bar-garden",
    src: openBarGarden,
    alt: "Open-Air Bar Garden with lush trees and twilight lighting",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Open-Air Bar Garden",
    tagline: "Lush outdoor garden lounge under Ado-Ekiti open skies",
    description:
      "Surrounded by manicured garden foliage and string illumination, the bar garden offers chilled draught beers, imported whiskies, craft cocktails, and fresh open-flame barbecue skewers.",
    highlights: [
      "Craft cocktail bar",
      "Live acoustic evenings",
      "Open-flame grill & suya",
      "Outdoor table service",
    ],
    tall: true,
    featured: true,
    actionUrl: "/dining",
    actionLabel: "Explore Bar Garden",
  },

  // 22. Garden Terrace Twilight
  {
    id: "openbar-garden-2",
    src: openBarGarden2,
    alt: "Twilight ambience at the open-air bar terrace with glowing garden lanterns",
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

  // 23. Cocktail Garden Stage
  {
    id: "openbar-garden-3",
    src: openBarGarden3,
    alt: "Cocktail garden landscape with night lighting and seating",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Open-Air Cocktail Garden & Stage",
    tagline: "The heartbeat of Ado-Ekiti evening leisure and social gatherings",
    description:
      "A vibrant yet sophisticated nightlife destination for hotel guests and local patrons alike, offering fine spirits, suya barbecue, and monthly live music.",
    highlights: [
      "Curated spirit selection",
      "Monthly karaoke & live bands",
      "Suya & grill station",
      "Secure on-site parking",
    ],
    tall: true,
  },

  // 24. OpenBar Sitout
  {
    id: "openbar-sitout",
    src: openBarSitout,
    alt: "Open-air bar sit-out tables and parasols surrounded by greenery",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Outdoor Patio & Sit-Out",
    tagline: "Casual alfresco seating for daytime drinks, fresh juices and snacks",
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

  // 25. Open Air Bar Sitout Night
  {
    id: "open-air-bar-sitout",
    src: openAirBarSitout,
    alt: "Evening open-air bar sitout tables under tropical evening sky",
    category: "dining",
    categoryLabel: "Dining & Cuisine",
    title: "Open Sky Evening Sit-Out Lounge",
    tagline: "Relaxed ambiance under tropical starlight with chilled drinks",
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

  // 26. Banky Hall
  {
    id: "banky-hall",
    src: bankyHall,
    alt: "Banky Hall main event and conference center with crystal chandeliers",
    category: "events",
    categoryLabel: "Halls & Banquets",
    title: "Banky Hall & Conference Ballroom",
    tagline: "State-of-the-art ballroom accommodating up to 300 guests",
    description:
      "Fully air-conditioned multipurpose banquet hall outfitted with crystal chandeliers, acoustic wall panelling, executive stage, crystal audio sound systems, and dedicated catering wing.",
    highlights: [
      "300 guest capacity",
      "Crystal chandelier lighting",
      "Full multimedia stage",
      "Dedicated banquet catering",
    ],
    specs: {
      size: "350 sqm",
      capacity: "300 Guests (Banquet)",
      rate: "Enquire for Event Rates",
      view: "Main Event Wing",
    },
    tall: true,
    featured: true,
    actionUrl: "/events",
    actionLabel: "Plan an Event at Banky Hall",
  },

  // 27. Events & Galas
  {
    id: "events-gala",
    src: events,
    alt: "Gala celebrations and event banquet setup with decorated round tables",
    category: "events",
    categoryLabel: "Halls & Banquets",
    title: "Gala Celebrations & Receptions",
    tagline: "Elegantly arranged for milestone birthdays, weddings & corporate AGMs",
    description:
      "Our in-house events team coordinates custom banquet setups, thematic lighting, gourmet buffet catering, and audio-visual equipment.",
    highlights: [
      "Full event decor services",
      "Buffet and plated service",
      "High-output backup generators",
      "Dedicated security and parking",
    ],
    tall: false,
    actionUrl: "/events",
    actionLabel: "Book Event Venue",
  },

  // 28. Side Hall Seminar
  {
    id: "side-hall-breakout",
    src: hotelSideHall2,
    alt: "Executive side hall seminar and meeting space with projection facilities",
    category: "events",
    categoryLabel: "Halls & Banquets",
    title: "Executive Seminar & Boardroom Hall",
    tagline: "Tailored breakout room for corporate board meetings, trainings & workshops",
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

  // 29. Banquet Service Wing
  {
    id: "side-hall-banquet",
    src: hotelSideHall3,
    alt: "Hotel side hall arranged for banquet dining and buffet transitions",
    category: "events",
    categoryLabel: "Halls & Banquets",
    title: "Banquet & Catering Wing",
    tagline: "Direct connection from main hall to dedicated dining stations",
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

  // 30. Hero Exterior
  {
    id: "hotel-exterior-front",
    src: heroExterior,
    alt: "Banky Hotel & Suites front facade at golden hour with bronze glass architecture",
    category: "exterior",
    categoryLabel: "Grounds & Facade",
    title: "Banky Hotel Main Facade",
    tagline: "Modern glass and architectural presence in Ado-Ekiti",
    description:
      "A striking multi-story boutique property designed with reflective bronze glass, private balconies, landscaped entrance driveways, and secure parking.",
    highlights: [
      "Secure perimeter wall",
      "24/7 armed security",
      "Paved guest parking",
      "Central Ado-Ekiti location",
    ],
    tall: true,
    featured: true,
  },

  // 31. Hero Arrival Porte-Cochere
  {
    id: "hero-arrival",
    src: hero,
    alt: "Grand entrance and arrival porte-cochere of Banky Hotel & Suites",
    category: "exterior",
    categoryLabel: "Grounds & Facade",
    title: "Grand Entrance & Porte-Cochère",
    tagline: "Covered arrival entrance for chauffeured drop-offs and seamless check-in",
    description:
      "Our covered porte-cochère shields arriving guests from sun and rain while valet attendants assist with luggage handling directly to reception.",
    highlights: [
      "Covered drop-off zone",
      "Valet luggage assistance",
      "Well-lit arrival driveway",
      "Wheelchair accessibility",
    ],
    tall: false,
  },

  // 32. West Wing Front
  {
    id: "leftside-hotel",
    src: leftsideHotelFront,
    alt: "West wing architectural view of Banky Hotel showing dedicated power substation",
    category: "exterior",
    categoryLabel: "Grounds & Facade",
    title: "West Wing Architecture & Power Hub",
    tagline: "Geometric lines and continuous uninterrupted 24/7 power infrastructure",
    description:
      "Demonstrating Banky Hotel's dedicated power substation and solar backups, ensuring 24/7 continuous air conditioning and lightning-fast Wi-Fi throughout your stay.",
    highlights: [
      "100% 24/7 generator backup",
      "Solar emergency lighting",
      "Sound-insulated exterior",
      "Gated compound",
    ],
    tall: false,
  },

  // 33. East Wing & Secure Gate
  {
    id: "rightside-hotel",
    src: rightsideHotelFront,
    alt: "East wing grounds and secure entry gate with 24/7 security post",
    category: "exterior",
    categoryLabel: "Grounds & Facade",
    title: "East Wing & Guarded Grounds",
    tagline: "Round-the-clock guarded security for total peace of mind in Ado-Ekiti",
    description:
      "Monitored by full-perimeter CCTV surveillance and professional uniformed security personnel, ensuring a tranquil and safe sanctuary for every guest.",
    highlights: [
      "24/7 CCTV surveillance",
      "Uniformed security personnel",
      "Controlled gated entry",
      "Secure valet parking",
    ],
    tall: false,
  },
];
