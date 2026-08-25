import { createFileRoute } from "@tanstack/react-router";
import { useState, useId } from "react";
import { PageHero } from "@/components/site/PageHero";
import suite from "@/assets/Signature Suite.jpg";
import { ROOMS, HOTEL, naira, whatsappLink, bookingMessage } from "@/lib/hotel";
import { submitReservationInquiry } from "@/lib/ai.functions";
import {
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  Copy,
  Check,
  Send,
  Loader2,
  Bot,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Printer,
  ExternalLink,
} from "lucide-react";

interface SearchParams {
  room?: string;
  checkIn?: string;
  checkOut?: string;
}

export const Route = createFileRoute("/reserve")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    room: typeof search.room === "string" ? search.room : undefined,
    checkIn: typeof search.checkIn === "string" ? search.checkIn : undefined,
    checkOut: typeof search.checkOut === "string" ? search.checkOut : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reservation Inquiry — Banky Hotel & Suites, Ado-Ekiti" },
      {
        name: "description",
        content:
          "Submit your reservation inquiry at Banky Hotel & Suites. Receive instant automated Gemini AI confirmation, WhatsApp verification, and secure booking.",
      },
      { property: "og:title", content: "Reserve — Banky Hotel & Suites" },
      {
        property: "og:description",
        content:
          "Direct reservation with best rates, complimentary breakfast, and personalized concierge confirmation.",
      },
    ],
  }),
  component: ReservePage,
});

function nights(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
  return diff > 0 ? Math.round(diff) : 0;
}

function ReservePage() {
  const search = Route.useSearch();
  const formId = useId();

  // Find initial room from search params if present
  const initialRoom = ROOMS.find((r) => r.slug === search.room) || ROOMS[3]!;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState(initialRoom.slug);
  const [checkIn, setCheckIn] = useState(search.checkIn || "");
  const [checkOut, setCheckOut] = useState(search.checkOut || "");
  const [guests, setGuests] = useState("2");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedData, setConfirmedData] = useState<{
    reference: string;
    aiConfirmation: string;
    guestName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    estimatedTotal: number;
  } | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  const room = ROOMS.find((r) => r.slug === slug) || ROOMS[0]!;
  const n = nights(checkIn, checkOut);
  const total = n > 0 ? n * room.rate : room.rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your phone or WhatsApp number.");
      return;
    }
    if (!checkIn) {
      setErrorMessage("Please select your arrival date.");
      return;
    }
    if (!checkOut) {
      setErrorMessage("Please select your departure date.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMessage("Departure date must be after arrival date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReservationInquiry({
        data: {
          guestName: name.trim(),
          guestEmail: email.trim(),
          guestPhone: phone.trim(),
          roomSlug: room.slug,
          roomName: room.name,
          checkIn,
          checkOut,
          guestsCount: parseInt(guests, 10) || 2,
          specialRequests: specialRequests.trim(),
          estimatedTotal: total,
        },
      });

      if (result && result.ok) {
        setConfirmedData({
          reference: result.reference,
          aiConfirmation: result.aiConfirmation,
          guestName: result.guestName,
          roomName: result.roomName,
          checkIn: result.checkIn,
          checkOut: result.checkOut,
          guestsCount: result.guestsCount,
          estimatedTotal: result.estimatedTotal,
        });
      } else {
        setErrorMessage("Something went wrong processing your inquiry. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Reservation inquiry submission failed:", err);
      setErrorMessage("Could not connect to reservation server. Please verify your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (confirmedData?.reference) {
      navigator.clipboard.writeText(confirmedData.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleReset = () => {
    setConfirmedData(null);
    setName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
  };

  return (
    <>
      <PageHero
        eyebrow="Direct Booking & Inquiries"
        title="Reserve Your Sanctuary"
        copy="Submit your booking inquiry to receive instant automated Gemini AI confirmation, personalized concierge service, and seamless reservation security."
        image={suite}
      />

      <section id="reservation-inquiry-section" className="container-x py-20">
        {confirmedData ? (
          /* Glassmorphism Confirmation Success Screen */
          <div
            id="reservation-confirmation-panel"
            className="mx-auto max-w-3xl rounded-3xl border border-white/30 dark:border-white/10 bg-card/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl animate-fade-in"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-border/70 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="eyebrow text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Inquiry Confirmed & Saved to Firestore
                  </span>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl">
                    Thank You, {confirmedData.guestName}!
                  </h2>
                </div>
              </div>

              {/* Reference Code Chip */}
              <div className="text-right">
                <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground block">
                  Reference Code
                </span>
                <button
                  type="button"
                  id="copy-reference-code-btn"
                  onClick={handleCopyReference}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-foreground hover:bg-muted"
                >
                  <span>{confirmedData.reference}</span>
                  {copiedRef ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* AI Automated Concierge Response Box */}
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase">
                <Bot className="h-4 w-4" />
                <span>Automated Concierge Confirmation (Google Gemini AI)</span>
              </div>

              <div className="mt-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-foreground/90 font-normal">
                {confirmedData.aiConfirmation}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4 text-xs text-muted-foreground">
                <span>Banky Hotel & Suites · Front Desk & Concierge</span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Direct Guarantee
                </span>
              </div>
            </div>

            {/* Reservation Summary Details */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-border/70 bg-muted/30 p-4 text-center">
              <div>
                <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground block">
                  Room
                </span>
                <span className="mt-1 font-medium text-xs sm:text-sm text-foreground block truncate">
                  {confirmedData.roomName}
                </span>
              </div>
              <div>
                <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground block">
                  Dates
                </span>
                <span className="mt-1 font-medium text-xs sm:text-sm text-foreground block">
                  {confirmedData.checkIn} → {confirmedData.checkOut}
                </span>
              </div>
              <div>
                <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground block">
                  Guests
                </span>
                <span className="mt-1 font-medium text-xs sm:text-sm text-foreground block">
                  {confirmedData.guestsCount} Guest(s)
                </span>
              </div>
              <div>
                <span className="text-[0.65rem] tracking-wider uppercase text-muted-foreground block">
                  Est. Total
                </span>
                <span className="mt-1 font-display text-sm sm:text-base text-foreground block">
                  {naira(confirmedData.estimatedTotal)}
                </span>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappLink(
                  `Hello Banky Hotel & Suites, I have submitted booking inquiry ${confirmedData.reference} for ${confirmedData.roomName} (${confirmedData.checkIn} to ${confirmedData.checkOut}) under the name ${confirmedData.guestName}. I would like to verify and finalize my reservation.`,
                )}
                target="_blank"
                rel="noreferrer"
                id="whatsapp-confirm-inquiry-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-center text-xs font-medium tracking-[0.16em] uppercase text-white shadow-md transition-opacity hover:opacity-90"
              >
                <span>Verify on WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href={HOTEL.paystack}
                target="_blank"
                rel="noreferrer"
                id="paystack-complete-payment-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-center text-xs font-medium tracking-[0.16em] uppercase text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              >
                <span>Pay via Paystack</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <button
                type="button"
                id="print-summary-btn"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Confirmation Summary</span>
              </button>

              <button
                type="button"
                id="new-inquiry-btn"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-foreground hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Submit Another Inquiry</span>
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Reservation Inquiry Form */
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <form id="reservation-inquiry-form" className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <h2 className="font-display text-3xl">Guest Reservation Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete the inquiry form below. Our AI concierge will automatically generate your
                  personalized reservation confirmation.
                </p>
              </div>

              {errorMessage && (
                <div
                  id="reservation-form-error"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
                >
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full Name" required>
                  <input
                    id="guest-name-input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Folashade Adeyemi"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </Field>

                <Field label="Email Address" required>
                  <input
                    id="guest-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. folashade@example.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </Field>

                <Field label="Phone / WhatsApp Number" required>
                  <input
                    id="guest-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 000 0000"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </Field>

                <Field label="Selected Room / Suite" required>
                  <select
                    id="room-select-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none cursor-pointer"
                  >
                    {ROOMS.map((r) => (
                      <option key={r.slug} value={r.slug} className="bg-background text-foreground">
                        {r.name} — {naira(r.rate)} / night
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Arrival Date (Check-in 2:00 PM)" required>
                  <input
                    id="checkin-date-input"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </Field>

                <Field label="Departure Date (Check-out 12:00 PM)" required>
                  <input
                    id="checkout-date-input"
                    type="date"
                    required
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </Field>

                <Field label="Number of Guests">
                  <select
                    id="guests-count-input"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none cursor-pointer"
                  >
                    {["1 Guest", "2 Guests", "3 Guests", "4 Guests", "5+ Guests"].map((g, i) => (
                      <option key={g} value={`${i + 1}`} className="bg-background text-foreground">
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Special Requests / Arrival Notes (Optional)"
                  className="sm:col-span-2"
                >
                  <textarea
                    id="special-requests-input"
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Late check-in after 8:00 PM, quiet high-floor room, dietary preferences, anniversary arrangement..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 resize-none"
                  />
                </Field>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  id="submit-inquiry-btn"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-xs font-medium tracking-[0.2em] uppercase text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating AI Confirmation & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Reservation Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Real-Time Glassmorphism Booking Summary Card */}
            <aside
              id="booking-summary-card"
              className="relative h-fit rounded-2xl border border-border/80 bg-card/70 p-8 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="eyebrow text-muted-foreground">Stay Summary</span>
                  <h3 className="mt-1 font-display text-2xl">{room.name}</h3>
                </div>
                <div className="text-right">
                  <span className="font-display text-lg text-foreground">{naira(room.rate)}</span>
                  <span className="text-[0.65rem] text-muted-foreground block uppercase">
                    / night
                  </span>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl bg-muted">
                <img src={room.image} alt={room.name} className="h-36 w-full object-cover" />
              </div>

              <dl className="mt-6 space-y-3.5 text-xs sm:text-sm">
                <Row
                  k="Duration of Stay"
                  v={n > 0 ? `${n} Night${n > 1 ? "s" : ""}` : "Select dates"}
                />
                <Row k="Check-in Date" v={checkIn || "Not selected"} />
                <Row k="Check-out Date" v={checkOut || "Not selected"} />
                <Row k="Occupancy" v={`${guests} Guest(s)`} />
                <Row k="Complimentary Breakfast" v="Included Daily" />
                <Row k="Internet" v="High-Speed Wi-Fi" />

                <div className="flex items-baseline justify-between border-t border-border pt-4">
                  <div>
                    <dt className="eyebrow text-muted-foreground">Estimated Total</dt>
                    <span className="text-[0.65rem] text-muted-foreground block">
                      {n > 0 ? `${n} nights × ${naira(room.rate)}` : "1 night preview"}
                    </span>
                  </div>
                  <dd className="font-display text-2xl text-foreground">{naira(total)}</dd>
                </div>
              </dl>

              {/* Direct WhatsApp Quick Chat Alternative */}
              <div className="mt-6 border-t border-border/70 pt-6">
                <a
                  href={whatsappLink(
                    bookingMessage({
                      name: name || "Guest",
                      room: room.name,
                      checkIn: checkIn || "Upcoming",
                      checkOut: checkOut || "Upcoming",
                      guests,
                      rate: room.rate,
                    }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  id="direct-whatsapp-booking-link"
                  className="block rounded-full border border-border px-6 py-3 text-center text-xs tracking-[0.16em] uppercase text-foreground hover:bg-muted transition-colors"
                >
                  Direct WhatsApp Inquiry
                </a>

                <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
                  Check-in {HOTEL.checkIn}, check-out {HOTEL.checkOut}. 24/7 Front desk support.
                  Free cancellation up to 48 hours before arrival.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
      <dt className="text-muted-foreground text-xs sm:text-sm">{k}</dt>
      <dd className="font-medium text-foreground text-xs sm:text-sm">{v}</dd>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`block border-b border-border/80 pb-2 ${className}`}>
      <span className="eyebrow block text-muted-foreground text-[0.68rem]">
        {label} {required && <span className="text-amber-500">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
