import { createFileRoute } from "@tanstack/react-router";
import { useState, useId, useEffect, useCallback } from "react";
import { PageHero } from "@/components/site/PageHero";
import suite from "@/assets/Signature Suite.jpg";
import { ROOMS, HOTEL, naira, whatsappLink, bookingMessage } from "@/lib/hotel";
import { submitReservationInquiry } from "@/lib/ai.functions";
import {
  BookingSuccessModal,
  BookingConfirmationDetails,
} from "@/components/site/BookingSuccessModal";
import { checkRoomAvailability, AvailabilityCheckResult } from "@/lib/availability";
import { RoomAvailabilityStatus } from "@/components/site/RoomAvailabilityStatus";
import { BookingSummarySkeleton } from "@/components/site/BookingSkeleton";
import { DateRangePicker } from "@/components/site/DateRangePicker";
import { PaystackCheckout } from "@/components/site/PaystackCheckout";
import { toast } from "sonner";
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
  Info,
  Clock,
  BedDouble,
  CreditCard,
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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedData, setConfirmedData] = useState<BookingConfirmationDetails | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  // Real-Time Room Availability State
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityCheckResult | null>(
    null,
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const runAvailabilityCheck = useCallback(
    async (rSlug: string, cIn: string, cOut: string, gCount: string) => {
      if (!cIn || !cOut) {
        setAvailabilityResult(null);
        return;
      }
      setIsCheckingAvailability(true);
      try {
        const res = await checkRoomAvailability({
          roomSlug: rSlug,
          checkIn: cIn,
          checkOut: cOut,
          guestsCount: parseInt(gCount, 10) || 2,
        });
        setAvailabilityResult(res);
      } catch (e) {
        console.error("Availability check failed:", e);
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      runAvailabilityCheck(slug, checkIn, checkOut, guests);
    }, 280);
    return () => clearTimeout(timer);
  }, [slug, checkIn, checkOut, guests, runAvailabilityCheck]);

  const room = ROOMS.find((r) => r.slug === slug) || ROOMS[0]!;
  const n = nights(checkIn, checkOut);
  const baseSubtotal = n > 0 ? n * room.rate : room.rate;
  const calculatedTotal = availabilityResult?.priceBreakdown?.total ?? baseSubtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      const msg = "Please enter your full name.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      const msg = "Please enter a valid email address.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!phone.trim()) {
      const msg = "Please enter your phone or WhatsApp number.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!checkIn) {
      const msg = "Please select your arrival date.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!checkOut) {
      const msg = "Please select your departure date.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      const msg = "Departure date must be after arrival date.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Availability validation check
    if (isCheckingAvailability) {
      const msg = "Verifying live room availability with front desk. Please wait a moment...";
      toast.info(msg);
      return;
    }

    if (availabilityResult?.status === "unavailable") {
      const msg = `${room.name} is fully booked for your selected dates. Please switch to an available suite or select different dates.`;
      setErrorMessage(msg);
      toast.error("Suite Unavailable for Selected Dates", {
        description: msg,
        duration: 5000,
      });
      return;
    }

    if (availabilityResult?.status === "invalid_dates") {
      const msg =
        availabilityResult.message || "Invalid dates chosen. Please adjust your calendar dates.";
      setErrorMessage(msg);
      toast.error(msg);
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
          estimatedTotal: calculatedTotal,
        },
      });

      if (result && result.ok) {
        const confDetails: BookingConfirmationDetails = {
          reference: result.reference,
          aiConfirmation: result.aiConfirmation,
          guestName: result.guestName,
          guestEmail: email.trim(),
          guestPhone: phone.trim(),
          roomSlug: room.slug,
          roomName: result.roomName,
          checkIn: result.checkIn,
          checkOut: result.checkOut,
          guestsCount: result.guestsCount,
          estimatedTotal: result.estimatedTotal,
          nightsCount: n,
          baseRate: room.rate,
        };

        setConfirmedData(confDetails);
        setIsSuccessModalOpen(true);

        toast.success("Reservation confirmed successfully!", {
          description: `Booking reference: ${result.reference}. Concierge dispatched.`,
          duration: 6000,
        });
      } else {
        const msg = "Something went wrong processing your inquiry. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      console.error("Reservation inquiry submission failed:", err);
      const msg = "Could not connect to reservation server. Please verify your details.";
      setErrorMessage(msg);
      toast.error(msg);
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

            {/* Paystack Online Payment Integration */}
            <div className="mt-8">
              <PaystackCheckout
                bookingReference={confirmedData.reference}
                amount={confirmedData.estimatedTotal}
                guestEmail={confirmedData.guestEmail}
                guestName={confirmedData.guestName}
                roomName={confirmedData.roomName}
              />
            </div>

            {/* Actions Grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/60 px-6 py-3.5 text-center text-xs font-medium tracking-[0.16em] uppercase text-foreground shadow-sm transition-opacity hover:bg-muted"
              >
                <span>Paystack Direct Link</span>
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

              {/* Interactive Visual Room Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-primary" />
                    1. Select Room or Suite
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {ROOMS.length} curated categories available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ROOMS.map((r) => {
                    const isSelected = r.slug === slug;
                    return (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => setSlug(r.slug)}
                        className={`group relative overflow-hidden rounded-xl border text-left transition-all p-2.5 flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-md"
                            : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
                        }`}
                      >
                        <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted">
                          <img
                            src={r.image}
                            alt={r.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-0.5 text-primary-foreground shadow">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        <div className="mt-2 space-y-0.5">
                          <h4 className="font-serif text-xs font-bold leading-tight line-clamp-1 text-foreground">
                            {r.name}
                          </h4>
                          <p className="text-[11px] font-semibold text-primary font-serif">
                            {naira(r.rate)}
                            <span className="text-[9px] font-sans font-normal text-muted-foreground">
                              /nt
                            </span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Guest Selection */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  2. Dates & Occupancy
                </span>

                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(cIn, cOut) => {
                    setCheckIn(cIn);
                    setCheckOut(cOut);
                  }}
                  className="rounded-xl border border-border/80 p-4 bg-muted/20"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Selected Room Category">
                    <select
                      id="room-select-input"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none cursor-pointer"
                    >
                      {ROOMS.map((r) => (
                        <option
                          key={r.slug}
                          value={r.slug}
                          className="bg-background text-foreground"
                        >
                          {r.name} — {naira(r.rate)} / night
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Number of Guests">
                    <select
                      id="guests-count-input"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none cursor-pointer"
                    >
                      {["1 Guest", "2 Guests", "3 Guests", "4 Guests", "5+ Guests"].map((g, i) => (
                        <option
                          key={g}
                          value={`${i + 1}`}
                          className="bg-background text-foreground"
                        >
                          {g}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Guest Personal Information */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  3. Guest Contact & Special Requests
                </span>

                <div className="grid gap-4 sm:grid-cols-2">
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

                  <Field label="Phone / WhatsApp Number" required className="sm:col-span-2">
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

                  <Field
                    label="Special Requests / Arrival Notes (Optional)"
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="special-requests-input"
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Late check-in after 8:00 PM, quiet high-floor room, dietary preferences, anniversary arrangement..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 resize-none"
                    />
                  </Field>
                </div>
              </div>

              {/* Real-Time Room Availability Checker Banner */}
              <RoomAvailabilityStatus
                result={availabilityResult}
                isChecking={isCheckingAvailability}
                onSelectAlternative={(altSlug) => setSlug(altSlug)}
                onRetryCheck={() => runAvailabilityCheck(slug, checkIn, checkOut, guests)}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-inquiry-btn"
                  disabled={isSubmitting || availabilityResult?.status === "unavailable"}
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

              <div className="mt-6 overflow-hidden rounded-xl bg-muted relative">
                <img src={room.image} alt={room.name} className="h-36 w-full object-cover" />
                {availabilityResult && (
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        availabilityResult.status === "available"
                          ? "bg-emerald-600/90 text-white"
                          : availabilityResult.status === "limited"
                            ? "bg-amber-600/90 text-white"
                            : "bg-red-600/90 text-white"
                      }`}
                    >
                      {availabilityResult.status === "available"
                        ? `${availabilityResult.availableUnits} Available`
                        : availabilityResult.status === "limited"
                          ? "Only 1 Left"
                          : "Fully Booked"}
                    </span>
                  </div>
                )}
              </div>

              <dl className="mt-6 space-y-3.5 text-xs sm:text-sm">
                <Row
                  k="Duration of Stay"
                  v={n > 0 ? `${n} Night${n > 1 ? "s" : ""}` : "Select dates"}
                />
                <Row k="Check-in Date" v={checkIn || "Not selected"} />
                <Row k="Check-out Date" v={checkOut || "Not selected"} />
                <Row k="Occupancy" v={`${guests} Guest(s)`} />
                <Row k="Room Rate Subtotal" v={naira(baseSubtotal)} />
                {availabilityResult?.priceBreakdown && n > 0 && (
                  <>
                    <Row k="VAT (7.5%)" v={naira(availabilityResult.priceBreakdown.vat)} />
                    <Row
                      k="State Tourism Levy (5.0%)"
                      v={naira(availabilityResult.priceBreakdown.tourismLevy)}
                    />
                  </>
                )}
                <Row k="Complimentary Breakfast" v="Included Daily" />
                <Row k="Internet" v="High-Speed Wi-Fi" />

                <div className="flex items-baseline justify-between border-t border-border pt-4">
                  <div>
                    <dt className="eyebrow text-muted-foreground">Estimated Total</dt>
                    <span className="text-[0.65rem] text-muted-foreground block">
                      {n > 0 ? `${n} night stay + statutory levies` : "1 night preview"}
                    </span>
                  </div>
                  <dd className="font-display text-2xl text-foreground">
                    {naira(calculatedTotal)}
                  </dd>
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

      {/* Booking Success Dialog Modal */}
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        data={confirmedData}
        onResetForm={handleReset}
      />
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
