import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { myReservations, myThread, guestMessage, requestChange } from "@/lib/guest.functions";
import { formatDate, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaystackCheckout } from "@/components/site/PaystackCheckout";
import { useBooking } from "@/components/site/SettingsContext";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  BedDouble,
  Users,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  LogOut,
  Send,
  User,
  Phone,
  HelpCircle,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "View your Banky Hotel & Suites reservation history, payment status, and direct front desk concierge line.",
      },
      { property: "og:title", content: "My Bookings — Banky Hotel & Suites" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyBookingsPage,
});

const naira = (v: number) => `₦${Number(v || 0).toLocaleString("en-NG")}`;

export function MyBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings, whatsappLink } = useBooking();

  const [activeFilter, setActiveFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">(
    "all",
  );
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [activePaymentRef, setActivePaymentRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => myReservations() as Promise<ReservationRecord[]>,
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut(auth);
    navigate({ to: "/auth", replace: true });
  };

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    toast.success("Reference code copied to clipboard!");
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Filter reservations based on active tab
  const filteredList = reservations.filter((r) => {
    const status = String(r.status || "pending").toLowerCase();
    if (activeFilter === "all") return true;
    if (activeFilter === "confirmed") {
      return status === "confirmed" || status === "checked_in" || status === "checked_out";
    }
    if (activeFilter === "pending") return status === "pending";
    if (activeFilter === "cancelled") return status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-serif text-lg font-bold text-foreground">
              {settings.hotel_name}
            </Link>
            <span className="hidden sm:inline-block text-muted-foreground/50">•</span>
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Guest Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild variant="outline" className="text-xs">
              <Link to="/reserve">New Booking</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSignOut}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <span className="eyebrow text-amber-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Firestore Guest Reservations
            </span>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl text-foreground">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your stays, complete secure online Paystack payments, and chat with our front
              desk.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2 text-center shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Total Stays
              </span>
              <span className="font-serif text-lg font-bold text-foreground">
                {reservations.length}
              </span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-center shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Confirmed
              </span>
              <span className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {
                  reservations.filter((r) => r.status === "confirmed" || r.status === "checked_in")
                    .length
                }
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
          {[
            { id: "all", label: "All Bookings", count: reservations.length },
            {
              id: "confirmed",
              label: "Confirmed / Active",
              count: reservations.filter((r) =>
                ["confirmed", "checked_in", "checked_out"].includes(r.status),
              ).length,
            },
            {
              id: "pending",
              label: "Pending Verification",
              count: reservations.filter((r) => r.status === "pending").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: reservations.filter((r) => r.status === "cancelled").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeFilter === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Fetching your reservation records from Firestore…
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredList.length === 0 && (
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
              {activeFilter === "all" ? "No reservations found" : `No ${activeFilter} bookings`}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
              {activeFilter === "all"
                ? "You have not made any bookings with this account email yet. Experience luxury in Ado-Ekiti today."
                : `You do not have any reservations currently matching the '${activeFilter}' filter.`}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                asChild
                className="rounded-full bg-primary text-xs uppercase tracking-wider font-semibold"
              >
                <Link to="/reserve">Make a Reservation</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full text-xs">
                <a
                  href={whatsappLink("Hello, I need assistance with my hotel booking.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Support
                </a>
              </Button>
            </div>
          </Card>
        )}

        {/* Reservations Cards List */}
        {!isLoading && filteredList.length > 0 && (
          <div className="space-y-4">
            {filteredList.map((res) => (
              <ReservationCard
                key={res.id}
                reservation={res}
                isThreadOpen={openThreadId === res.id}
                onToggleThread={() => setOpenThreadId(openThreadId === res.id ? null : res.id)}
                isPaymentOpen={activePaymentRef === res.reference}
                onTogglePayment={() =>
                  setActivePaymentRef(activePaymentRef === res.reference ? null : res.reference)
                }
                onCopyRef={() => handleCopy(res.reference)}
                isCopied={copiedRef === res.reference}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ReservationCard({
  reservation,
  isThreadOpen,
  onToggleThread,
  isPaymentOpen,
  onTogglePayment,
  onCopyRef,
  isCopied,
}: {
  reservation: ReservationRecord;
  isThreadOpen: boolean;
  onToggleThread: () => void;
  isPaymentOpen: boolean;
  onTogglePayment: () => void;
  onCopyRef: () => void;
  isCopied: boolean;
}) {
  const { whatsappLink } = useBooking();
  const status = String(reservation.status || "pending").toLowerCase();
  const paymentStatus = String(reservation.payment_status || "unpaid").toLowerCase();

  const isPaid = paymentStatus === "paid";
  const isCancelled = status === "cancelled";
  const isConfirmed = status === "confirmed" || status === "checked_in";
  const isPending = status === "pending";

  return (
    <Card className="overflow-hidden border border-border/80 bg-card transition-all shadow-sm hover:shadow-md">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-6 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ref:
          </span>
          <button
            type="button"
            onClick={onCopyRef}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground transition-colors hover:bg-muted"
            title="Click to copy booking reference"
          >
            <span>{reservation.reference}</span>
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Label */}
          {isConfirmed ? (
            <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmed
            </Badge>
          ) : isPending ? (
            <Badge className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold py-1 px-3">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </Badge>
          ) : isCancelled ? (
            <Badge className="gap-1 bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[11px] font-semibold py-1 px-3">
              <XCircle className="h-3.5 w-3.5" />
              Cancelled
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] py-1 px-3">
              {reservation.status}
            </Badge>
          )}

          {/* Payment Status Label */}
          {isPaid ? (
            <Badge className="gap-1 bg-emerald-600 text-white border-transparent text-[11px] font-semibold py-1 px-2.5">
              <CreditCard className="h-3 w-3" />
              Paid
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-amber-400/50 text-amber-600 dark:text-amber-400 text-[11px] font-semibold py-1 px-2.5"
            >
              <CreditCard className="h-3 w-3" />
              Unpaid
            </Badge>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow text-amber-500">Accommodation</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mt-0.5">
                {reservation.room_name}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  Check-in
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {formatDate(reservation.check_in)}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  Check-out
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {formatDate(reservation.check_out)}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  Duration / Guests
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {reservation.nights} night(s) · {reservation.guests} guest(s)
                </span>
              </div>
            </div>

            {reservation.requests && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 border border-border/50">
                <strong className="text-foreground font-medium">Special Requests: </strong>
                {reservation.requests}
              </div>
            )}
          </div>

          {/* Pricing and Quick Actions Sidebar */}
          <div className="flex flex-col justify-between border-t border-border/60 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Total Amount
              </span>
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
                {naira(reservation.total)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {naira(reservation.rate)} / night (incl. VAT &amp; levy)
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {!isPaid && !isCancelled && (
                <Button
                  onClick={onTogglePayment}
                  className="w-full gap-2 rounded-full bg-primary text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isPaymentOpen ? "Hide Paystack" : "Pay with Paystack"}</span>
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleThread}
                  className="flex-1 gap-1.5 text-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{isThreadOpen ? "Hide Chat" : "Front Desk Chat"}</span>
                </Button>

                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a
                    href={whatsappLink(
                      `Hello Banky Hotel & Suites, I am inquiring about my booking #${reservation.reference} for ${reservation.room_name}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    title="Chat on WhatsApp"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Paystack Checkout Component */}
        {isPaymentOpen && !isPaid && !isCancelled && (
          <div className="mt-6 border-t border-border/80 pt-6">
            <PaystackCheckout
              bookingReference={reservation.reference}
              amount={reservation.total}
              guestEmail={reservation.guest_email}
              guestName={reservation.guest_name}
              roomName={reservation.room_name}
              onSuccess={() => onTogglePayment()}
            />
          </div>
        )}

        {/* Messaging Thread Drawer */}
        {isThreadOpen && (
          <div className="mt-6 border-t border-border/80 pt-6">
            <GuestChatThread reservationId={reservation.id} />
          </div>
        )}
      </div>
    </Card>
  );
}

function GuestChatThread({ reservationId }: { reservationId: string }) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["my-thread", reservationId],
    queryFn: () => myThread({ data: { reservationId } }),
    refetchInterval: 6000,
  });

  const sendMut = useMutation({
    mutationFn: () =>
      guestMessage({
        data: {
          reservationId,
          body: messageText.trim(),
        },
      }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["my-thread", reservationId] });
      toast.success("Message dispatched to Front Desk Concierge.");
    },
    onError: (err) => {
      toast.error((err as Error).message || "Failed to send message.");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMut.mutate();
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <MessageSquare className="h-4 w-4" />
          <span>Direct Front Desk &amp; Concierge Line</span>
        </div>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live 24/7 Desk
        </span>
      </div>

      {/* Messages List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {isLoading && (
          <p className="text-xs text-muted-foreground animate-pulse">Loading message thread…</p>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">
            No messages sent yet. Send a message to the front desk regarding early check-in, dietary
            preferences, or room service.
          </p>
        )}

        {messages.map((m: Record<string, unknown>, idx: number) => {
          const isGuest = m["sender"] === "guest";
          return (
            <div key={idx} className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isGuest
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground shadow-sm"
                }`}
              >
                <div className="font-semibold text-[10px] opacity-80 mb-1">
                  {isGuest ? "You (Guest)" : "Banky Front Desk"}
                </div>
                <div>{String(m["body"] || "")}</div>
              </div>
              <span className="mt-1 text-[9px] text-muted-foreground px-1">
                {m["created_at"]
                  ? new Date(String(m["created_at"])).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border/60">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message to front desk staff..."
          className="text-xs"
          disabled={sendMut.isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={sendMut.isPending || !messageText.trim()}
          className="gap-1.5 bg-primary text-primary-foreground"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
