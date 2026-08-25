import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  Copy,
  Check,
  Bot,
  ShieldCheck,
  Printer,
  ExternalLink,
  X,
  Phone,
  CreditCard,
  FileText,
  BadgePercent,
  BedDouble,
} from "lucide-react";
import { HOTEL, naira, whatsappLink } from "@/lib/hotel";
import { PaystackCheckout } from "@/components/site/PaystackCheckout";
import { toast } from "sonner";

export interface BookingConfirmationDetails {
  reference: string;
  aiConfirmation: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomSlug: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  estimatedTotal: number;
  nightsCount?: number;
  statutoryVat?: number;
  tourismLevy?: number;
  baseRate?: number;
}

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BookingConfirmationDetails | null;
  onResetForm?: () => void;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  data,
  onResetForm,
}: BookingSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.reference);
    setCopied(true);
    toast.success("Reference code copied to clipboard!", {
      description: data.reference,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    toast.info("Preparing printable guest invoice...");
    window.print();
  };

  const whatsappInquiryMsg = `Hello Banky Hotel & Suites, I have completed my direct booking inquiry ${data.reference} for ${data.roomName} (${data.checkIn} to ${data.checkOut}) under the name ${data.guestName}. Please confirm my arrival reservation.`;

  // Tax calculation formula as specified in hospitality guidelines:
  // Statutory VAT = 7.5%, State Tourism Levy = 5.0% (Combined 12.5%)
  const subtotal = data.estimatedTotal;
  const vatAmount = Math.round(subtotal * 0.075);
  const tourismLevyAmount = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + vatAmount + tourismLevyAmount;

  return (
    <div
      id="booking-success-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-3xl border border-white/30 dark:border-white/10 bg-card p-6 sm:p-9 shadow-2xl backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-booking-success-modal-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 rounded-full border border-border bg-muted/60 p-2 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Ribbon */}
        <div className="flex items-start gap-4 border-b border-border/80 pb-6 pr-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              Reservation Confirmed
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl text-foreground">
              Thank You, {data.guestName}!
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your luxury booking inquiry has been recorded and scheduled with Front Desk Concierge.
            </p>
          </div>
        </div>

        {/* Reference Code Highlight */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:px-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground block">
              Official Booking Reference
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-primary mt-0.5">
              {data.reference}
            </div>
          </div>
          <button
            type="button"
            id="modal-copy-reference-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-primary" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Room & Dates Summary Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4 text-center">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <BedDouble className="h-3 w-3" />
              Accommodation
            </div>
            <div className="mt-1 font-medium text-xs sm:text-sm text-foreground truncate">
              {data.roomName}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Stay Period
            </div>
            <div className="mt-1 font-medium text-xs text-foreground">
              {data.checkIn} → {data.checkOut}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Occupancy
            </div>
            <div className="mt-1 font-medium text-xs sm:text-sm text-foreground">
              {data.guestsCount} Guest(s)
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <BadgePercent className="h-3 w-3" />
              Total with Taxes
            </div>
            <div className="mt-1 font-display text-sm sm:text-base font-bold text-foreground">
              {naira(totalAmount)}
            </div>
          </div>
        </div>

        {/* Automated AI Concierge Confirmation Box */}
        {data.aiConfirmation && (
          <div className="mt-5 rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              <Bot className="h-3.5 w-3.5" />
              <span>Automated Gemini AI Concierge Dispatch</span>
            </div>
            <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line max-h-36 overflow-y-auto pr-2">
              {data.aiConfirmation}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Guaranteed Best Rate
              </span>
              <span>Front Desk: +234 703 690 5671</span>
            </div>
          </div>
        )}

        {/* Paystack Online Payment Integration */}
        <div className="mt-6">
          <PaystackCheckout
            bookingReference={data.reference}
            amount={totalAmount}
            guestEmail={data.guestEmail}
            guestName={data.guestName}
            roomName={data.roomName}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={whatsappLink(whatsappInquiryMsg)}
            target="_blank"
            rel="noreferrer"
            id="modal-whatsapp-confirm-btn"
            onClick={() => toast.success("Opening WhatsApp Concierge verification channel...")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-center text-xs font-semibold tracking-[0.16em] uppercase text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Phone className="h-4 w-4" />
            <span>Verify on WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <a
            href={HOTEL.paystack}
            target="_blank"
            rel="noreferrer"
            id="modal-paystack-checkout-btn"
            onClick={() => toast.info("Redirecting to Paystack payment page...")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/60 px-6 py-3 text-center text-xs font-semibold tracking-[0.16em] uppercase text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
          >
            <CreditCard className="h-4 w-4" />
            <span>Direct Paystack Link</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Footer Utilities */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4 text-xs text-muted-foreground">
          <button
            type="button"
            id="modal-print-invoice-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Summary / Voucher</span>
          </button>

          <button
            type="button"
            id="modal-done-btn"
            onClick={() => {
              onClose();
              if (onResetForm) onResetForm();
            }}
            className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            <span>Done & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
}
