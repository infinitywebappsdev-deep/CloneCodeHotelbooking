import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Calendar,
  MessageSquare,
  Bed,
  Utensils,
  GlassWater,
  PartyPopper,
  Building2,
  Layers,
  ArrowRight,
  Check,
  Search,
  Grid3X3,
  Columns,
  Heart,
  Play,
  Pause,
  Share2,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { whatsappLink } from "@/lib/hotel";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { GallerySkeleton } from "./GallerySkeleton";
import {
  GALLERY_ITEMS,
  GALLERY_CATEGORIES,
  GalleryCategory,
  GalleryItem,
} from "@/lib/gallery-data";

export { GALLERY_ITEMS, GALLERY_CATEGORIES };
export type { GalleryCategory, GalleryItem };

interface MasonryGalleryProps {
  initialCategory?: GalleryCategory;
  showFilters?: boolean;
  showSearch?: boolean;
  showViewToggle?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
  defaultLayout?: "masonry" | "grid";
}

export function MasonryGallery({
  initialCategory = "all",
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  limit,
  title,
  subtitle,
  defaultLayout = "masonry",
}: MasonryGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>(initialCategory);
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">(defaultLayout);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("banky_gallery_favorites");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleCategoryChange = (catId: GalleryCategory) => {
    if (catId === activeCategory && !showFavoritesOnly) return;
    setIsTransitioning(true);
    setActiveCategory(catId);
    setShowFavoritesOnly(false);
    setSelectedImageIndex(null);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  };

  const handleToggleFavorites = () => {
    setIsTransitioning(true);
    setShowFavoritesOnly(!showFavoritesOnly);
    setSelectedImageIndex(null);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  };

  // Sync favorites to localStorage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("banky_gallery_favorites", JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      // Category match
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;

      // Favorites match
      const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);

      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.highlights.some((h) => h.toLowerCase().includes(q));

      return matchesCategory && matchesFavorites && matchesSearch;
    }).slice(0, limit ?? GALLERY_ITEMS.length);
  }, [activeCategory, showFavoritesOnly, favorites, searchQuery, limit]);

  const selectedItem: GalleryItem | null =
    selectedImageIndex !== null ? (filteredItems[selectedImageIndex] ?? null) : null;

  // Navigation handlers for Lightbox
  const handlePrev = useCallback(() => {
    if (selectedImageIndex === null || filteredItems.length === 0) return;
    setIsZoomed(false);
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : 0,
    );
  }, [selectedImageIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (selectedImageIndex === null || filteredItems.length === 0) return;
    setIsZoomed(false);
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : 0,
    );
  }, [selectedImageIndex, filteredItems.length]);

  const handleClose = useCallback(() => {
    setSelectedImageIndex(null);
    setIsZoomed(false);
    setIsPlayingSlideshow(false);
  }, []);

  // Slideshow auto-advance effect
  useEffect(() => {
    if (!isPlayingSlideshow || selectedImageIndex === null) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlayingSlideshow, selectedImageIndex, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlayingSlideshow((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImageIndex, handleClose, handlePrev, handleNext]);

  // Copy shareable link
  const handleShare = () => {
    if (typeof window !== "undefined" && selectedItem) {
      const url = `${window.location.origin}/gallery?photo=${selectedItem.id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const CATEGORY_ICONS: Record<GalleryCategory, React.ElementType> = {
    all: Layers,
    rooms: Bed,
    dining: Utensils,
    amenities: GlassWater,
    events: PartyPopper,
    exterior: Building2,
  };

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GALLERY_ITEMS.length };
    GALLERY_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div id="hotel-gallery-section" className="w-full">
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-10 text-center sm:text-left">
          {subtitle && (
            <span className="eyebrow text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {subtitle}
            </span>
          )}
          {title && <h2 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h2>}
        </div>
      )}

      {/* Control Bar: Filters, Search, and View Mode */}
      {showFilters && (
        <div className="mb-10 space-y-6">
          {/* Top Bar: Category Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {GALLERY_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const isActive = activeCategory === cat.id && !showFavoritesOnly;
                const count = categoryCounts[cat.id] ?? 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`gallery-filter-${cat.id}`}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                        : "border border-border/80 bg-card/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                    <span>{cat.label}</span>
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Favorites Filter Tab */}
              {favorites.length > 0 && (
                <button
                  type="button"
                  id="gallery-filter-favorites"
                  onClick={handleToggleFavorites}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                    showFavoritesOnly
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.02]"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${showFavoritesOnly ? "fill-white text-white" : "fill-rose-500 text-rose-500"}`}
                  />
                  <span>Saved</span>
                  <span className="ml-1 rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] text-current">
                    {favorites.length}
                  </span>
                </button>
              )}
            </div>

            {/* View Mode Controls */}
            {showViewToggle && (
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-full border border-border bg-card/60 p-1">
                  <button
                    type="button"
                    id="view-mode-masonry"
                    onClick={() => setLayoutMode("masonry")}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      layoutMode === "masonry"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Masonry Flow"
                    aria-label="Masonry Layout"
                  >
                    <Columns className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    id="view-mode-grid"
                    onClick={() => setLayoutMode("grid")}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      layoutMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Uniform Grid"
                    aria-label="Grid Layout"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search & Metadata Bar */}
          {showSearch && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  id="gallery-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search suites, amenities, hall, garden, billiard..."
                  className="h-10 w-full rounded-full border border-border bg-card/80 pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Showing {filteredItems.length} of {GALLERY_ITEMS.length} photographs
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty Search State */}
      {filteredItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <Info className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="mt-4 font-display text-2xl">No Photographs Found</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            No hotel spaces matched your search criteria "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setShowFavoritesOnly(false);
            }}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Loading Skeleton Transition State */}
      {isTransitioning ? (
        <GallerySkeleton mode={layoutMode} count={limit ?? 8} />
      ) : (
        <>
          {/* Gallery Layout: Masonry Columns OR Uniform Grid */}
          {filteredItems.length > 0 && layoutMode === "masonry" && (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-6">
              {filteredItems.map((item, index) => {
                const isFav = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    id={`gallery-thumb-${item.id}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl break-inside-avoid"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedImageIndex(index);
                      }
                    }}
                    aria-label={`View photo of ${item.title}`}
                  >
                    {/* Image Component with Luxury Placeholder */}
                    <div className="relative overflow-hidden">
                      <ImagePlaceholder
                        src={item.src}
                        alt={item.alt}
                        tall={item.tall}
                        imgClassName="group-hover:scale-105"
                      />

                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95 pointer-events-none" />

                      {/* Category Pill on top-left */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.62rem] font-semibold tracking-widest uppercase text-white/90 backdrop-blur-md shadow-sm">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Floating Action Buttons top-right */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                        {/* Favorite / Bookmark Heart Button */}
                        <button
                          type="button"
                          id={`favorite-btn-${item.id}`}
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition-transform active:scale-90 ${
                            isFav
                              ? "bg-rose-600 text-white border-rose-500"
                              : "bg-black/40 text-white/80 hover:bg-black/70 hover:text-white"
                          }`}
                          title={isFav ? "Remove from saved" : "Save space"}
                          aria-label="Bookmark photo"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${isFav ? "fill-white text-white" : "text-white/90"}`}
                          />
                        </button>

                        {/* Expand Icon */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* Card Footer Content */}
                      <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/15 bg-black/65 p-4 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-black/80">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg leading-tight text-white group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          {item.specs?.rate && (
                            <span className="shrink-0 rounded-md bg-amber-400/20 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-300">
                              {item.specs.rate}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
                          {item.tagline}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[0.68rem] tracking-wider uppercase text-amber-300/90 font-medium">
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Explore Specifications
                          </span>
                          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gallery Layout: Uniform Grid Mode */}
          {filteredItems.length > 0 && layoutMode === "grid" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item, index) => {
                const isFav = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    id={`gallery-grid-thumb-${item.id}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedImageIndex(index);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ImagePlaceholder
                        src={item.src}
                        alt={item.alt}
                        aspectRatio="square"
                        imgClassName="group-hover:scale-105"
                      />

                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity pointer-events-none" />

                      {/* Category Pill */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.62rem] font-semibold tracking-widest uppercase text-white/90 backdrop-blur-md">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Heart Bookmark */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition-transform active:scale-90 ${
                            isFav ? "bg-rose-600 text-white" : "bg-black/40 text-white/80"
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-white" : ""}`} />
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/15 bg-black/65 p-3 text-white backdrop-blur-md">
                        <h3 className="font-display text-base leading-tight text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-white/75 line-clamp-1">
                          {item.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Interactive Fullscreen Lightbox Modal */}
      {selectedItem && selectedImageIndex !== null && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl transition-opacity duration-300 animate-in fade-in"
          onClick={handleClose}
        >
          {/* Top Control Header Bar */}
          <div
            className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/90 to-transparent text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                {selectedItem.categoryLabel}
              </span>
              <span className="text-xs text-white/60">
                {selectedImageIndex + 1} of {filteredItems.length}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Slideshow Play / Pause */}
              <button
                type="button"
                id="lightbox-slideshow-btn"
                onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
                className={`flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors ${
                  isPlayingSlideshow
                    ? "border-amber-400 bg-amber-400/20 text-amber-300"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isPlayingSlideshow ? "Pause Slideshow (Space)" : "Play Slideshow (Space)"}
              >
                {isPlayingSlideshow ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isPlayingSlideshow ? "Pause" : "Slideshow"}
                </span>
              </button>

              {/* Share / Copy Link */}
              <button
                type="button"
                id="lightbox-share-btn"
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                title="Copy share link"
                aria-label="Share photograph link"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>

              {/* Zoom Toggle */}
              <button
                type="button"
                id="lightbox-zoom-btn"
                onClick={() => setIsZoomed(!isZoomed)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
                  isZoomed
                    ? "border-amber-400 bg-amber-400/20 text-amber-300"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isZoomed ? "Zoom out" : "Zoom in"}
                aria-label="Toggle zoom"
              >
                {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                id="lightbox-close-btn"
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-red-500/80 hover:border-red-500 transition-colors ml-2"
                title="Close Lightbox (Esc)"
                aria-label="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            id="lightbox-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 z-40 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-2xl"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            id="lightbox-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 z-40 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-2xl"
            aria-label="Next photograph"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Main Lightbox Body (Image & Story Card) */}
          <div
            className="relative z-30 mx-auto flex h-full max-h-[92vh] w-full max-w-7xl flex-col lg:flex-row items-center justify-center gap-6 p-4 sm:p-8 pt-16 pb-24 overflow-y-auto lg:overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview Container */}
            <div className="relative flex max-h-[55vh] lg:max-h-[78vh] w-full lg:w-3/5 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl">
              <img
                src={selectedItem.src}
                alt={selectedItem.alt}
                className={`max-h-[55vh] lg:max-h-[78vh] w-full object-contain transition-all duration-300 ${
                  isZoomed ? "scale-135 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Information Card & Booking Actions */}
            <div className="w-full lg:w-2/5 rounded-2xl border border-white/15 bg-black/80 p-6 sm:p-8 text-white backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-amber-300 uppercase tracking-widest text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {selectedItem.categoryLabel}
                </span>
                {selectedItem.specs?.rate && (
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300">
                    {selectedItem.specs.rate}
                  </span>
                )}
              </div>

              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-white">
                {selectedItem.title}
              </h2>
              <p className="mt-2 text-sm text-amber-200/90 font-medium">{selectedItem.tagline}</p>

              <p className="mt-4 text-sm leading-relaxed text-white/80 font-light border-t border-white/10 pt-4">
                {selectedItem.description}
              </p>

              {/* Specs Grid */}
              {selectedItem.specs && (
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs">
                  {selectedItem.specs.size && (
                    <div className="flex flex-col">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">
                        Room Size
                      </span>
                      <span className="font-semibold text-white/90">{selectedItem.specs.size}</span>
                    </div>
                  )}
                  {selectedItem.specs.capacity && (
                    <div className="flex flex-col">
                      <span className="text-white/50 text-[10px] uppercase tracking-wider">
                        Capacity
                      </span>
                      <span className="font-semibold text-white/90">
                        {selectedItem.specs.capacity}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Highlights Checklist */}
              {selectedItem.highlights.length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <span className="text-[0.68rem] tracking-widest uppercase text-white/60 font-semibold block mb-3">
                    Key Features & Amenities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/90">
                    {selectedItem.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                {selectedItem.actionUrl && (
                  <Link
                    to={selectedItem.actionUrl}
                    id="lightbox-primary-action"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wider uppercase text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{selectedItem.actionLabel ?? "Reserve Online"}</span>
                  </Link>
                )}
                <a
                  href={whatsappLink(
                    `Hello Banky Hotel & Suites, I am inquiring about ${selectedItem.title}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  id="lightbox-whatsapp-action"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Ask Front Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Filmstrip */}
          <div
            className="absolute bottom-2 inset-x-0 z-40 hidden sm:flex items-center justify-center gap-2 overflow-x-auto px-4 py-2 bg-gradient-to-t from-black/90 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredItems.map((thumb, idx) => (
              <button
                key={thumb.id}
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setSelectedImageIndex(idx);
                }}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                  idx === selectedImageIndex
                    ? "border-amber-400 scale-110 ring-2 ring-amber-400/50"
                    : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={thumb.src} alt={thumb.title} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
