import { useState, useEffect } from "react";
import { ImageOff, Sparkles, RefreshCw } from "lucide-react";

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | "auto";
  tall?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onClick?: () => void;
}

export function ImagePlaceholder({
  src,
  alt,
  className = "",
  imgClassName = "",
  aspectRatio = "auto",
  tall = false,
  priority = false,
  onLoad,
  onClick,
}: ImagePlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src, retryKey]);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[16/10]",
    auto: tall ? "h-[440px]" : "h-[290px]",
  }[aspectRatio];

  return (
    <div
      className={`relative overflow-hidden bg-neutral-900 ${aspectClass} ${className}`}
      onClick={onClick}
    >
      {/* Luxury Ambient Shimmer Placeholder (Visible until image loads) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-neutral-400">
          {/* Animated Gold Shimmer Gradient */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Centered Hotel Monogram / Icon */}
          <div className="relative flex flex-col items-center gap-2 opacity-60">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
              <Sparkles className="h-4 w-4 text-amber-400/80 animate-pulse" />
            </div>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400">
              Banky Hotel
            </span>
          </div>
        </div>
      )}

      {/* Actual Image with Progressive Fade-in */}
      {!hasError && (
        <img
          key={retryKey}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
          } ${imgClassName}`}
        />
      )}

      {/* Graceful Error Fallback State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 p-6 text-center text-neutral-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 mb-3">
            <ImageOff className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-xs font-medium text-neutral-200">{alt || "Hotel Photograph"}</p>
          <p className="mt-1 text-[11px] text-neutral-400">Unable to load image</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRetryKey((k) => k + 1);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
