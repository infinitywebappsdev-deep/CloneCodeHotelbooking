import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BedDouble,
  Users,
} from "lucide-react";
import { AvailabilityCheckResult, AlternativeRoom } from "@/lib/availability";
import { naira } from "@/lib/hotel";

interface RoomAvailabilityStatusProps {
  result: AvailabilityCheckResult | null;
  isChecking: boolean;
  onSelectAlternative?: (roomSlug: string) => void;
  onRetryCheck?: () => void;
  className?: string;
}

export function RoomAvailabilityStatus({
  result,
  isChecking,
  onSelectAlternative,
  onRetryCheck,
  className = "",
}: RoomAvailabilityStatusProps) {
  if (isChecking) {
    return (
      <div
        id="availability-checking-state"
        className={`rounded-2xl border border-primary/20 bg-primary/5 p-4.5 backdrop-blur-md transition-all duration-300 animate-pulse ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping opacity-60" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Live Inventory Check
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                Querying...
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Verifying real-time suite availability with front desk dispatch...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result || result.status === "idle") {
    return (
      <div
        id="availability-idle-state"
        className={`rounded-2xl border border-border/60 bg-muted/30 p-4 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BedDouble className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Real-Time Availability Ready
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              Select arrival and departure dates to verify live inventory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === "invalid_dates") {
    return (
      <div
        id="availability-invalid-dates-state"
        className={`rounded-2xl border border-destructive/30 bg-destructive/10 p-4 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Date Verification Notice
            </span>
            <p className="mt-0.5 text-xs text-destructive/90">{result.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === "unavailable") {
    return (
      <div
        id="availability-unavailable-state"
        className={`space-y-4 rounded-2xl border border-red-500/40 bg-red-500/5 p-5 shadow-sm transition-all duration-300 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Fully Booked For Selected Dates
                </span>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                  0 Units Available
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground/80 leading-relaxed">{result.message}</p>
            </div>
          </div>

          {onRetryCheck && (
            <button
              type="button"
              onClick={onRetryCheck}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Alternative Suite Recommendations */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div className="mt-3 border-t border-red-500/20 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Recommended Available Suites for Your Dates:
            </span>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {result.alternatives.map((alt: AlternativeRoom) => (
                <div
                  key={alt.slug}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={alt.image}
                      alt={alt.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {alt.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {naira(alt.rate)} / night · {alt.occupancy}
                      </div>
                    </div>
                  </div>

                  {onSelectAlternative && (
                    <button
                      type="button"
                      onClick={() => onSelectAlternative(alt.slug)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-primary transition-colors"
                    >
                      <span>Switch</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Available or Limited Status
  const isLimited = result.status === "limited";

  return (
    <div
      id="availability-confirmed-state"
      className={`rounded-2xl border ${
        isLimited ? "border-amber-500/40 bg-amber-500/5" : "border-emerald-500/40 bg-emerald-500/5"
      } p-4.5 shadow-sm transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isLimited
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isLimited ? <Zap className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLimited
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {result.badgeText}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isLimited
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {result.availableUnits} of {result.totalUnits} Ready
              </span>
            </div>
            <p className="mt-0.5 text-xs text-foreground/80">{result.message}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-background/80 px-2.5 py-1 rounded-full border border-border/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Locked Price</span>
        </div>
      </div>
    </div>
  );
}
