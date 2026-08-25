import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmPaystackPayment } from "@/lib/site.functions";
import { HOTEL, naira } from "@/lib/hotel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Loader2,
  ExternalLink,
  Receipt,
  Sparkles,
} from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in kobo
        ref?: string;
        currency?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string; trxref: string; status: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackCheckoutProps {
  bookingReference: string;
  amount: number;
  guestEmail: string;
  guestName: string;
  roomName: string;
  onSuccess?: (paystackRef: string) => void;
  className?: string;
}

export function PaystackCheckout({
  bookingReference,
  amount,
  guestEmail,
  guestName,
  roomName,
  onSuccess,
  className = "",
}: PaystackCheckoutProps) {
  const queryClient = useQueryClient();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paidRef, setPaidRef] = useState<string | null>(null);

  // Load Paystack Inline JS script dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.warn("Could not load Paystack inline JS, falling back to direct secure checkout.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script cached in document
    };
  }, []);

  const confirmPaymentMutation = useMutation({
    mutationFn: (paystackTrxRef: string) =>
      confirmPaystackPayment({
        data: {
          reference: bookingReference,
          paystackRef: paystackTrxRef,
          amount,
          guestEmail,
        },
      }),
    onSuccess: (data) => {
      setIsProcessing(false);
      setIsPaid(true);
      toast.success("Payment confirmed successfully!", {
        description: `Your reservation #${bookingReference} is now fully paid and confirmed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      if (onSuccess && paidRef) onSuccess(paidRef);
    },
    onError: (err) => {
      setIsProcessing(false);
      toast.error((err as Error).message || "Could not verify payment with server.");
    },
  });

  const handlePaystackInline = () => {
    setIsProcessing(true);

    const paystackKey =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) ||
      "pk_test_sample_banky_hotel_key"; // Fallback test key

    const generatedTxRef = `BHS-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const amountInKobo = Math.round(amount * 100);

    if (window.PaystackPop && window.PaystackPop.setup) {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: guestEmail || "reservations@bankyhotelandsuites.com",
          amount: amountInKobo,
          ref: generatedTxRef,
          currency: "NGN",
          metadata: {
            custom_fields: [
              {
                display_name: "Guest Name",
                variable_name: "guest_name",
                value: guestName,
              },
              {
                display_name: "Room Suite",
                variable_name: "room_name",
                value: roomName,
              },
              {
                display_name: "Booking Reference",
                variable_name: "booking_ref",
                value: bookingReference,
              },
            ],
          },
          callback: (response) => {
            const trxRef = response.reference || response.trxref || generatedTxRef;
            setPaidRef(trxRef);
            confirmPaymentMutation.mutate(trxRef);
          },
          onClose: () => {
            setIsProcessing(false);
            toast.info("Payment window closed. You can complete your payment at any time.");
          },
        });

        handler.openIframe();
      } catch (err) {
        console.warn("Paystack popup setup error, redirecting to payment page:", err);
        window.open(HOTEL.paystack, "_blank");
        setIsProcessing(false);
      }
    } else {
      // Fallback redirect
      window.open(HOTEL.paystack, "_blank");
      setIsProcessing(false);
      toast.info("Redirected to Banky Hotel Paystack secure payment page.");
    }
  };

  if (isPaid) {
    return (
      <Card className="border-emerald-500/40 bg-emerald-500/5 p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="mt-3 font-serif text-lg font-bold text-foreground">
          Payment Verified &amp; Confirmed
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          We have securely received your payment of{" "}
          <strong className="text-foreground">{naira(amount)}</strong> for {roomName}.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-background px-3 py-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">
          <Receipt className="h-3.5 w-3.5" />
          <span>Trx Ref: {paidRef || bookingReference}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <CreditCard className="h-4 w-4" />
            <span>Paystack Secure Online Checkout</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <Lock className="h-3 w-3" /> 256-Bit SSL
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-primary/10 pt-3">
          <span className="text-xs text-muted-foreground">Total Payable Amount:</span>
          <span className="font-display text-xl font-bold text-foreground">{naira(amount)}</span>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Pay with Debit Card (Mastercard, Visa, Verve), Bank Transfer, USSD, or Apple Pay.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <Button
            type="button"
            onClick={handlePaystackInline}
            disabled={isProcessing}
            className="flex-1 gap-2 rounded-full bg-primary py-5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Pay {naira(amount)} Now</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-full text-xs font-medium"
          >
            <a href={HOTEL.paystack} target="_blank" rel="noreferrer" className="gap-1.5">
              <span>Paystack Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
