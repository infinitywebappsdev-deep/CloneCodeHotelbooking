import signatureSuiteImg from "@/assets/Signature Suite.jpg";
import diplomaticSuiteImg from "@/assets/Diplomatic Suite.jpg";
import superExecutiveImg from "@/assets/Super Executive.jpg";
import executiveSuiteImg from "@/assets/Executive Suite.jpg";
import standardPlusImg from "@/assets/Standard Plus.jpg";
import deluxeImg from "@/assets/Duluxe.jpg";
import suite1Img from "@/assets/Suite1.jpg";
import standardRoomImg from "@/assets/Standard room.jpg";

export const HOTEL = {
  name: "Banky Hotel & Suites",
  tagline: "Quiet Luxury in the Heart of Ado-Ekiti",
  address: "Ado-Ekiti, Ekiti State, Nigeria",
  phone: "+2347047004816",
  whatsapp: "+2347047004816",
  email: "reservations@bankyhotelandsuites.com",
  paystack: "https://paystack.shop/pay/lni6oqnifn",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
};

export type Room = {
  slug: string;
  name: string;
  rate: number;
  qty: number;
  occupancy: string;
  size: string;
  image: string;
  blurb: string;
  features: string[];
};

export const ROOMS: Room[] = [
  {
    slug: "signature-suite",
    name: "Signature Suite",
    rate: 150000,
    qty: 1,
    occupancy: "2 guests",
    size: "78 sqm",
    image: signatureSuiteImg,
    blurb:
      "Our most private residence: a sunlit living room, dressing area and a bedroom framed by full-height windows.",
    features: [
      "Private living room",
      "Butler service",
      "Complimentary breakfast",
      "Airport transfer",
    ],
  },
  {
    slug: "diplomatic-suite",
    name: "Diplomatic Suite",
    rate: 75000,
    qty: 1,
    occupancy: "2 guests",
    size: "56 sqm",
    image: diplomaticSuiteImg,
    blurb:
      "A composed suite for visiting dignitaries, with a separate lounge and dedicated workspace.",
    features: ["Separate lounge", "Executive desk", "Breakfast for two", "Late checkout"],
  },
  {
    slug: "super-executive",
    name: "Super Executive",
    rate: 55000,
    qty: 2,
    occupancy: "2 guests",
    size: "42 sqm",
    image: superExecutiveImg,
    blurb: "Generous proportions, a reading corner and soft daylight all afternoon.",
    features: ["King bed", "Reading corner", "Smart TV", "Daily housekeeping"],
  },
  {
    slug: "executive",
    name: "Executive Room",
    rate: 45000,
    qty: 7,
    occupancy: "2 guests",
    size: "36 sqm",
    image: executiveSuiteImg,
    blurb: "Warm timber, crisp linen and a work desk built for long, productive stays.",
    features: ["King bed", "Work desk", "Rain shower", "Complimentary Wi-Fi"],
  },
  {
    slug: "standard-plus",
    name: "Standard Plus",
    rate: 45000,
    qty: 2,
    occupancy: "2 guests",
    size: "34 sqm",
    image: standardPlusImg,
    blurb: "An elevated take on our standard room, with an extended seating area.",
    features: ["Queen bed", "Seating area", "Smart TV", "Air conditioning"],
  },
  {
    slug: "deluxe",
    name: "Deluxe Room",
    rate: 40000,
    qty: 6,
    occupancy: "2 guests",
    size: "32 sqm",
    image: deluxeImg,
    blurb: "Understated comfort with garden-facing windows and a calm, neutral palette.",
    features: ["Queen bed", "Garden view", "Smart TV", "24-hour room service"],
  },
  {
    slug: "studio",
    name: "Studio",
    rate: 35000,
    qty: 1,
    occupancy: "2 guests",
    size: "30 sqm",
    image: suite1Img,
    blurb: "An open-plan studio designed for longer stays in the city.",
    features: ["Open plan", "Kitchenette", "Work nook", "Laundry service"],
  },
  {
    slug: "standard",
    name: "Standard Room",
    rate: 30000,
    qty: 7,
    occupancy: "2 guests",
    size: "28 sqm",
    image: standardRoomImg,
    blurb: "Everything you need, nothing you don't — bright, quiet and impeccably kept.",
    features: ["Double bed", "Smart TV", "Air conditioning", "Complimentary Wi-Fi"],
  },
];

export const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function bookingMessage(input: {
  room?: string;
  name?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string | number;
  rate?: number;
  reference?: string;
}) {
  const lines = [
    `Hello ${HOTEL.name}, I would like to make a reservation.`,
    input.name ? `Name: ${input.name}` : null,
    input.room ? `Room: ${input.room}` : null,
    input.checkIn ? `Check-in: ${input.checkIn}` : null,
    input.checkOut ? `Check-out: ${input.checkOut}` : null,
    input.guests ? `Guests: ${input.guests}` : null,
    input.rate ? `Rate: ${naira(input.rate)} per night` : null,
    input.reference ? `Reference: ${input.reference}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function makeReference() {
  return `BHS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
