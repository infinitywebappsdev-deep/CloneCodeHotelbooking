// Project image registry and utilities for YouTube / Media integration
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

export type ProjectImageCategory =
  "all" | "rooms" | "lobby" | "dining" | "events" | "exterior" | "amenities";

export interface ProjectAsset {
  id: string;
  name: string;
  category: ProjectImageCategory;
  categoryLabel: string;
  src: string;
  publicPath: string;
  tags: string[];
}

export const PROJECT_ASSETS: ProjectAsset[] = [
  // Suites & Rooms
  {
    id: "signature-suite",
    name: "Signature Presidential Suite",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: signatureSuite,
    publicPath: "/images/Signature Suite.jpg",
    tags: ["suite", "signature", "luxury", "bedroom", "presidential"],
  },
  {
    id: "diplomatic-suite",
    name: "Diplomatic Suite",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: diplomaticSuite,
    publicPath: "/images/Diplomatic Suite.jpg",
    tags: ["suite", "diplomatic", "vip", "bedroom"],
  },
  {
    id: "super-executive",
    name: "Super Executive Suite",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: superExecutive,
    publicPath: "/images/Super Executive.jpg",
    tags: ["executive", "super", "bedroom", "suite"],
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: executiveSuite,
    publicPath: "/images/Executive Suite.jpg",
    tags: ["executive", "suite", "bedroom"],
  },
  {
    id: "room-executive",
    name: "Executive Room Classic",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: roomExecutive,
    publicPath: "/images/room-executive.jpg",
    tags: ["room", "executive", "bed"],
  },
  {
    id: "duluxe-room",
    name: "Deluxe King Room",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: duluxe,
    publicPath: "/images/Duluxe.jpg",
    tags: ["deluxe", "king", "room"],
  },
  {
    id: "standard-plus",
    name: "Standard Plus Room",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: standardPlus,
    publicPath: "/images/Standard Plus.jpg",
    tags: ["standard", "plus", "room"],
  },
  {
    id: "standard-room",
    name: "Standard Room",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: standardRoom,
    publicPath: "/images/Standard room.jpg",
    tags: ["standard", "room", "bed"],
  },
  {
    id: "room-standard-alt",
    name: "Standard Room Comfort",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: roomStandard,
    publicPath: "/images/room-standard.jpg",
    tags: ["standard", "room"],
  },
  {
    id: "suite-1",
    name: "Royal Suite Living Area",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: suite1,
    publicPath: "/images/Suite1.jpg",
    tags: ["suite", "living", "sofa"],
  },
  {
    id: "room-suite-alt",
    name: "Suite Interior Ambience",
    category: "rooms",
    categoryLabel: "Suites & Rooms",
    src: roomSuite,
    publicPath: "/images/room-suite.jpg",
    tags: ["suite", "ambience"],
  },

  // Lobby & Lounges
  {
    id: "hotel-lobby-main",
    name: "Grand Hotel Lobby",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: hotelLobby,
    publicPath: "/images/Hotel Lobby.jpg",
    tags: ["lobby", "grand", "entrance", "interior"],
  },
  {
    id: "hotel-lobby-alt",
    name: "Lobby Seating & Atrium",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: lobby,
    publicPath: "/images/lobby.jpg",
    tags: ["lobby", "atrium", "seating"],
  },
  {
    id: "reception-desk",
    name: "Concierge & Front Desk",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: reception,
    publicPath: "/images/Reception.jpg",
    tags: ["reception", "front desk", "concierge"],
  },
  {
    id: "reception-view-2",
    name: "Reception Hallway",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: reception1,
    publicPath: "/images/Reception1.jpg",
    tags: ["reception", "hall"],
  },
  {
    id: "vip-lounge",
    name: "Executive VIP Lounge",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: lounge,
    publicPath: "/images/lounge.jpg",
    tags: ["lounge", "vip", "cocktail", "relax"],
  },
  {
    id: "lounge-seating",
    name: "Private Cocktail Lounge",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: lounge1,
    publicPath: "/images/lounge1.jpg",
    tags: ["lounge", "bar", "cocktails"],
  },
  {
    id: "ballard-table",
    name: "Billiards & Game Lounge",
    category: "lobby",
    categoryLabel: "Lobby & Lounges",
    src: ballardTable,
    publicPath: "/images/Ballard Table.jpg",
    tags: ["billiards", "games", "pool", "entertainment"],
  },

  // Dining & Bars
  {
    id: "restaurant-main",
    name: "Signature Fine Dining Restaurant",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: restaurant2,
    publicPath: "/images/Restaurant 2.jpg",
    tags: ["restaurant", "dining", "food", "tables"],
  },
  {
    id: "dining-hall",
    name: "Gourmet Breakfast & Buffet Hall",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: dining,
    publicPath: "/images/dining.jpg",
    tags: ["dining", "buffet", "breakfast", "cuisine"],
  },
  {
    id: "openbar-garden",
    name: "Open-Air Garden Lounge",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: openBarGarden,
    publicPath: "/images/OpenBar Garden.jpg",
    tags: ["bar", "garden", "outdoor", "cocktails"],
  },
  {
    id: "openbar-garden-2",
    name: "Garden Terrace Evening View",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: openBarGarden2,
    publicPath: "/images/OpenBar Garden 2.jpg",
    tags: ["bar", "garden", "outdoor", "night"],
  },
  {
    id: "openbar-garden-3",
    name: "Garden Bar Cabana",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: openBarGarden3,
    publicPath: "/images/OpenBar Garden 3.jpg",
    tags: ["bar", "garden", "cabana"],
  },
  {
    id: "openbar-sitout",
    name: "Sunset Open Bar Sit-out",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: openBarSitout,
    publicPath: "/images/OpenBar sitout.jpg",
    tags: ["bar", "sitout", "drinks", "evening"],
  },
  {
    id: "open-air-bar-sitout-alt",
    name: "Courtyard Bar Pavilion",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: openAirBarSitout,
    publicPath: "/images/open air bar sitout.jpg",
    tags: ["bar", "outdoor", "drinks"],
  },

  // Events & Halls
  {
    id: "banky-hall",
    name: "Banky Grand Banquet Hall",
    category: "events",
    categoryLabel: "Events & Halls",
    src: bankyHall,
    publicPath: "/images/BankyHall.jpg",
    tags: ["hall", "events", "banquet", "wedding", "conference"],
  },
  {
    id: "events-conference",
    name: "Events & Convention Center",
    category: "events",
    categoryLabel: "Events & Halls",
    src: events,
    publicPath: "/images/events.jpg",
    tags: ["events", "meeting", "conference", "party"],
  },
  {
    id: "hotel-side-hall-2",
    name: "Executive Meeting Hall",
    category: "events",
    categoryLabel: "Events & Halls",
    src: hotelSideHall2,
    publicPath: "/images/hotel side hall 2.jpg",
    tags: ["hall", "meeting", "seminar"],
  },
  {
    id: "hotel-side-hall-3",
    name: "Private Reception Suite Hall",
    category: "events",
    categoryLabel: "Events & Halls",
    src: hotelSideHall3,
    publicPath: "/images/hotel side hall 3.jpg",
    tags: ["hall", "private", "gathering"],
  },

  // Exterior & Grounds
  {
    id: "hero-facade",
    name: "Banky Hotel Architectural Facade",
    category: "exterior",
    categoryLabel: "Exterior & Grounds",
    src: heroExterior,
    publicPath: "/images/hero-exterior.jpg",
    tags: ["exterior", "facade", "building", "hero", "architecture"],
  },
  {
    id: "hero-grounds",
    name: "Hotel Grounds & Driveway",
    category: "exterior",
    categoryLabel: "Exterior & Grounds",
    src: hero,
    publicPath: "/images/hero.jpg",
    tags: ["exterior", "grounds", "driveway", "arrival"],
  },
  {
    id: "leftside-front",
    name: "Hotel Wing West Facade",
    category: "exterior",
    categoryLabel: "Exterior & Grounds",
    src: leftsideHotelFront,
    publicPath: "/images/leftside hotel front.jpg",
    tags: ["exterior", "front", "facade", "west"],
  },
  {
    id: "rightside-front",
    name: "Hotel Wing East Facade",
    category: "exterior",
    categoryLabel: "Exterior & Grounds",
    src: rightsideHotelFront,
    publicPath: "/images/rightside hotel front.jpg",
    tags: ["exterior", "front", "facade", "east"],
  },
  {
    id: "luxury-spa-suite",
    name: "Luxury Wellness & Spa Suite",
    category: "amenities",
    categoryLabel: "Spa & Amenities",
    src: "/images/luxury-spa.jpg",
    publicPath: "/images/luxury-spa.jpg",
    tags: ["spa", "wellness", "massage", "amenities", "relaxation"],
  },
  {
    id: "swimming-pool-resort",
    name: "Resort Swimming Pool & Cabanas",
    category: "amenities",
    categoryLabel: "Spa & Amenities",
    src: "/images/swimming-pool.jpg",
    publicPath: "/images/swimming-pool.jpg",
    tags: ["pool", "swimming", "cabana", "outdoor", "sunset", "amenities"],
  },
  {
    id: "chef-cuisine-special",
    name: "Chef's Signature Plated Cuisine",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: "/images/chef-cuisine.jpg",
    publicPath: "/images/chef-cuisine.jpg",
    tags: ["dining", "gourmet", "food", "chef", "restaurant"],
  },
  {
    id: "cocktail-lounge-bar",
    name: "Artisanal Cocktail & Spirit Bar",
    category: "dining",
    categoryLabel: "Dining & Bars",
    src: "/images/cocktail-lounge.jpg",
    publicPath: "/images/cocktail-lounge.jpg",
    tags: ["bar", "cocktails", "lounge", "spirits", "drinks"],
  },
];

/**
 * Extracts a YouTube Video ID from any standard YouTube URL format
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // youtube.com/watch?v=ID or /v/ID or /embed/ID or /shorts/ID
  const regExp =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

/**
 * Converts a YouTube URL to high-resolution thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  urlOrId: string,
  quality: "maxres" | "hq" | "mq" = "maxres",
): string | null {
  const videoId = extractYouTubeId(urlOrId) || (urlOrId.length === 11 ? urlOrId : null);
  if (!videoId) return null;

  switch (quality) {
    case "maxres":
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case "hq":
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case "mq":
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    default:
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}

/**
 * Converts a YouTube URL into an embed link
 */
export function getYouTubeEmbedUrl(urlOrId: string): string | null {
  const videoId = extractYouTubeId(urlOrId) || (urlOrId.length === 11 ? urlOrId : null);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}
