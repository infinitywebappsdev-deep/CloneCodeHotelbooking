import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface GallerySkeletonProps {
  mode?: "masonry" | "grid";
  count?: number;
}

export function GallerySkeleton({ mode = "masonry", count = 8 }: GallerySkeletonProps) {
  // Diverse aspect heights for masonry simulation
  const heights = [
    "h-[380px]",
    "h-[260px]",
    "h-[420px]",
    "h-[300px]",
    "h-[360px]",
    "h-[280px]",
    "h-[440px]",
    "h-[320px]",
  ];

  return (
    <div id="gallery-skeleton-container" className="w-full space-y-8 animate-fade-in">
      {/* Category Pills Skeleton */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-6">
        {[110, 95, 100, 115, 105, 120].map((width, i) => (
          <Skeleton
            key={i}
            className="h-9 rounded-full bg-muted/70"
            style={{ width: `${width}px` }}
          />
        ))}
      </div>

      {/* Search & Counter Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-md rounded-full bg-muted/70" />
        <Skeleton className="h-5 w-36 rounded-full bg-muted/60" />
      </div>

      {/* Grid or Masonry Skeleton items */}
      {mode === "masonry" ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-6">
          {Array.from({ length: count }).map((_, index) => {
            const h = heights[index % heights.length];
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-2 shadow-sm break-inside-avoid"
              >
                <div className={`relative w-full ${h} rounded-xl overflow-hidden bg-muted/80`}>
                  {/* Shimmer gradient effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Category Pill Skeleton */}
                  <div className="absolute top-3 left-3">
                    <Skeleton className="h-5 w-20 rounded-full bg-black/40" />
                  </div>

                  {/* Caption & Title Skeleton at bottom */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <Skeleton className="h-3 w-1/2 bg-white/15" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-2 shadow-sm"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/80">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-5 w-20 rounded-full bg-black/40" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-white/20" />
                  <Skeleton className="h-3 w-1/2 bg-white/15" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
