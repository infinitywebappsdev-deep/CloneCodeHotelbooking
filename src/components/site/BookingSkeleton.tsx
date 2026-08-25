import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingSummarySkeleton() {
  return (
    <div
      id="booking-summary-skeleton"
      className="relative h-fit rounded-2xl border border-border/80 bg-card/70 p-8 shadow-xl backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-muted/60" />
          <Skeleton className="h-7 w-36 bg-muted/80" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-6 w-24 ml-auto bg-muted/80" />
          <Skeleton className="h-3 w-12 ml-auto bg-muted/50" />
        </div>
      </div>

      {/* Room Image Skeleton */}
      <div className="overflow-hidden rounded-xl bg-muted/80 h-36 w-full relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Rows */}
      <div className="space-y-3 pt-2">
        {[
          ["w-24", "w-28"],
          ["w-20", "w-24"],
          ["w-20", "w-24"],
          ["w-16", "w-20"],
          ["w-32", "w-24"],
        ].map(([k, v], idx) => (
          <div key={idx} className="flex justify-between items-center py-1">
            <Skeleton className={`h-3.5 ${k} bg-muted/60`} />
            <Skeleton className={`h-3.5 ${v} bg-muted/80`} />
          </div>
        ))}

        <div className="border-t border-border pt-4 flex justify-between items-baseline">
          <div className="space-y-1">
            <Skeleton className="h-3 w-24 bg-muted/60" />
            <Skeleton className="h-2.5 w-32 bg-muted/40" />
          </div>
          <Skeleton className="h-7 w-28 bg-muted/90" />
        </div>
      </div>

      {/* Guarantee Badge */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-full bg-primary/20 shrink-0" />
        <div className="space-y-1 w-full">
          <Skeleton className="h-3 w-3/4 bg-primary/20" />
          <Skeleton className="h-2.5 w-1/2 bg-primary/15" />
        </div>
      </div>
    </div>
  );
}

export function BookingFormSkeleton() {
  return (
    <div id="booking-form-skeleton" className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-muted/80" />
        <Skeleton className="h-4 w-96 bg-muted/60" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-border/70 pb-3 space-y-2">
            <Skeleton className="h-3 w-28 bg-muted/50" />
            <Skeleton className="h-8 w-full bg-muted/40 rounded-md" />
          </div>
        ))}
        <div className="sm:col-span-2 border-b border-border/70 pb-3 space-y-2">
          <Skeleton className="h-3 w-40 bg-muted/50" />
          <Skeleton className="h-20 w-full bg-muted/40 rounded-md" />
        </div>
      </div>

      <div className="pt-4">
        <Skeleton className="h-12 w-64 rounded-full bg-primary/40" />
      </div>
    </div>
  );
}
