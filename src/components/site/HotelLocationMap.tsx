import { useState } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Car,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Plane,
  Trees,
  Landmark,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { HOTEL, whatsappLink } from "@/lib/hotel";

interface LandmarkItem {
  id: string;
  name: string;
  category: "culture" | "academic" | "nature" | "transport";
  distance: string;
  driveTime: string;
  description: string;
  icon: typeof Landmark;
}

const LANDMARKS: LandmarkItem[] = [
  {
    id: "fajuyi",
    name: "Fajuyi Memorial Park & Civic Centre",
    category: "culture",
    distance: "2.5 km",
    driveTime: "5 mins",
    description:
      "Iconic central recreational landmark, lush gardens and civic monuments in Ado-Ekiti.",
    icon: Landmark,
  },
  {
    id: "secretariat",
    name: "Ekiti State Government Secretariat",
    category: "culture",
    distance: "3.2 km",
    driveTime: "7 mins",
    description: "Hub of government ministries, executive chambers, and official state agencies.",
    icon: Landmark,
  },
  {
    id: "abuad",
    name: "Afe Babalola University (ABUAD)",
    category: "academic",
    distance: "11.0 km",
    driveTime: "18 mins",
    description: "Premier international university campus and Multi-System Teaching Hospital.",
    icon: GraduationCap,
  },
  {
    id: "eksu",
    name: "Ekiti State University (EKSU)",
    category: "academic",
    distance: "8.5 km",
    driveTime: "15 mins",
    description: "Major university campus along the Iworoko Road educational corridor.",
    icon: GraduationCap,
  },
  {
    id: "ikogosi",
    name: "Ikogosi Warm & Cold Springs Resort",
    category: "nature",
    distance: "42.0 km",
    driveTime: "45 mins",
    description:
      "World-famous natural geological marvel where warm and cold thermal springs flow side by side.",
    icon: Trees,
  },
  {
    id: "arinta",
    name: "Arinta Waterfalls, Ipole-Iloro",
    category: "nature",
    distance: "48.0 km",
    driveTime: "50 mins",
    description: "Cascading multi-tiered rainforest waterfall and eco-tourism paradise.",
    icon: Trees,
  },
  {
    id: "akure-airport",
    name: "Akure Domestic Airport (AKR)",
    category: "transport",
    distance: "46.0 km",
    driveTime: "50 mins",
    description:
      "Commercial flights connecting Lagos & Abuja. Banky Hotel arranges direct private chauffeur transfers.",
    icon: Plane,
  },
];

export function HotelLocationMap() {
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkItem>(LANDMARKS[0]);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [copied, setCopied] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Banky Hotel and Suites, Ado-Ekiti, Ekiti State, Nigeria",
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${HOTEL.name}, ${HOTEL.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Maps Embed Query
  const embedSrc =
    mapType === "satellite"
      ? `https://maps.google.com/maps?q=7.6211,5.2215&t=k&z=15&ie=UTF8&iwloc=&output=embed`
      : `https://maps.google.com/maps?q=Banky+Hotel+and+Suites+Ado+Ekiti+Ekiti+State&t=m&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div id="hotel-location-component" className="w-full">
      {/* Top Banner */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div>
          <span className="eyebrow text-muted-foreground flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Prime Ado-Ekiti Location
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Finding Banky Hotel & Suites</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Centrally situated in Ado-Ekiti, offering tranquil retreat seclusion while maintaining
            effortless accessibility to major government offices, universities, and Ekiti's renowned
            natural tourist attractions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            id="open-google-maps-directions"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

          <button
            type="button"
            id="copy-hotel-address-btn"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-foreground hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Address Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Interactive Map Frame with Glass Controls */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-xl">
          {/* Map Type Controls Floating Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full border border-white/30 bg-black/60 p-1 backdrop-blur-md">
            <button
              type="button"
              id="map-mode-standard"
              onClick={() => setMapType("standard")}
              className={`rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wider uppercase transition-colors ${
                mapType === "standard"
                  ? "bg-white text-black font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Standard Map
            </button>
            <button
              type="button"
              id="map-mode-satellite"
              onClick={() => setMapType("satellite")}
              className={`rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wider uppercase transition-colors ${
                mapType === "satellite"
                  ? "bg-white text-black font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Satellite View
            </button>
          </div>

          {/* Hotel Location Badge Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 hidden sm:flex items-center justify-between rounded-xl border border-white/20 bg-black/60 p-4 backdrop-blur-md text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/30 text-white border border-white/20">
                <MapPin className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-display text-sm tracking-wide">Banky Hotel & Suites</h4>
                <p className="text-xs text-white/80">{HOTEL.address}</p>
              </div>
            </div>
            <a
              href={`tel:${HOTEL.phone}`}
              className="rounded-full bg-white/20 px-3 py-1.5 text-[0.7rem] tracking-wider uppercase text-white hover:bg-white hover:text-black transition-colors"
            >
              Call Reception
            </a>
          </div>

          {/* Embedded Google Map */}
          <iframe
            title="Banky Hotel and Suites Interactive Google Map View"
            src={embedSrc}
            className="h-[480px] w-full border-0 transition-opacity duration-500"
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* Surroundings & Attractions Explorer */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-xl text-foreground">Nearby & Surroundings</h3>
              <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground">
                Click to explore
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {LANDMARKS.map((landmark) => {
                const Icon = landmark.icon;
                const isSelected = selectedLandmark.id === landmark.id;
                return (
                  <button
                    key={landmark.id}
                    type="button"
                    id={`landmark-select-${landmark.id}`}
                    onClick={() => setSelectedLandmark(landmark)}
                    className={`w-full text-left rounded-xl p-3 transition-all duration-200 border ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">{landmark.name}</h4>
                          <span className="text-[0.68rem] text-muted-foreground">
                            {landmark.distance} · {landmark.driveTime} drive
                          </span>
                        </div>
                      </div>
                      <Car className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-1" />
                    </div>

                    {isSelected && (
                      <p className="mt-2.5 text-[0.75rem] leading-relaxed text-muted-foreground border-t border-border/40 pt-2 animate-fade-in">
                        {landmark.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chauffeur & Airport Transport Card */}
          <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-primary" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Airport Chauffeur Service
                </h4>
                <p className="text-xs text-muted-foreground">
                  Akure Domestic Airport (AKR) transfers arranged on request.
                </p>
              </div>
            </div>
            <a
              href={whatsappLink(
                "Hello Banky Hotel Front Desk, I would like to inquire about airport pickup/chauffeur transfer services for my upcoming stay.",
              )}
              target="_blank"
              rel="noreferrer"
              id="request-airport-transfer-btn"
              className="mt-3 block text-center rounded-lg bg-foreground py-2 text-[0.7rem] font-medium tracking-[0.14em] uppercase text-background transition-opacity hover:opacity-90"
            >
              Book Chauffeur Transfer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
