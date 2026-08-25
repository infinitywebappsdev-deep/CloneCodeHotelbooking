import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  MessageSquarePlus,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Bed,
  Utensils,
  Smile,
  Award,
  ThumbsUp,
  Building,
} from "lucide-react";
import { listTestimonials, submitTestimonial, Testimonial } from "@/lib/testimonials.functions";
import { toast } from "sonner";

interface SatisfactionScore {
  category: string;
  score: string;
  max: string;
  percentage: number;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SATISFACTION_SCORES: SatisfactionScore[] = [
  {
    category: "Cleanliness & Sanitization",
    score: "9.9",
    max: "10",
    percentage: 99,
    highlight: "Daily deep sanitization & crisp high-thread linens",
    icon: Sparkles,
  },
  {
    category: "Staff & Concierge Warmth",
    score: "9.8",
    max: "10",
    percentage: 98,
    highlight: "24/7 personalized reception & authentic Ekiti hospitality",
    icon: Smile,
  },
  {
    category: "Uninterrupted Power & Security",
    score: "10.0",
    max: "10",
    percentage: 100,
    highlight: "Dedicated solar/generator substation & 24/7 CCTV",
    icon: Zap,
  },
  {
    category: "Room Comfort & Acoustics",
    score: "9.9",
    max: "10",
    percentage: 99,
    highlight: "Orthopedic king bedding & whisper-quiet AC",
    icon: Bed,
  },
  {
    category: "Restaurant 2 & Bar Dining",
    score: "9.8",
    max: "10",
    percentage: 98,
    highlight: "Authentic pounded yam, egusi, asun & fine cocktails",
    icon: Utensils,
  },
  {
    category: "Banky Hall & Event Service",
    score: "9.7",
    max: "10",
    percentage: 97,
    highlight: "300-guest ballroom acoustics & banquet coordination",
    icon: Building,
  },
];

export function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Form State
  const [guestName, setGuestName] = useState("");
  const [location, setLocation] = useState("");
  const [stayType, setStayType] = useState("Executive Suite Stay");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load testimonials
  const loadData = useCallback(async () => {
    try {
      const data = await listTestimonials();
      if (Array.isArray(data) && data.length > 0) {
        setTestimonials(data);
      }
    } catch (e) {
      console.warn("Failed to load testimonials:", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "executive")
      return (
        t.stay_type.toLowerCase().includes("executive") ||
        t.stay_type.toLowerCase().includes("signature") ||
        t.stay_type.toLowerCase().includes("diplomatic")
      );
    if (activeCategory === "events")
      return (
        t.stay_type.toLowerCase().includes("hall") ||
        t.stay_type.toLowerCase().includes("wedding") ||
        t.stay_type.toLowerCase().includes("event")
      );
    if (activeCategory === "dining")
      return (
        t.content.toLowerCase().includes("food") ||
        t.content.toLowerCase().includes("restaurant") ||
        t.content.toLowerCase().includes("yam") ||
        t.content.toLowerCase().includes("bar")
      );
    return true;
  });

  const displayList = filteredTestimonials.length > 0 ? filteredTestimonials : testimonials;

  // Autoplay Slider
  useEffect(() => {
    if (displayList.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayList.length, isPaused]);

  // Reset index on filter change
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const handlePrev = () => {
    if (displayList.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? displayList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displayList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !content.trim()) {
      toast.error("Please fill in your name and review remarks.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitTestimonial({
        data: {
          guest_name: guestName.trim(),
          location: location.trim() || "Nigeria",
          rating,
          content: content.trim(),
          stay_type: stayType.trim(),
        },
      });
      setSubmitSuccess(true);
      toast.success("Review published successfully!", {
        description: "Thank you for sharing your experience with Banky Hotel & Suites.",
      });
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setGuestName("");
        setLocation("");
        setContent("");
        loadData();
      }, 1500);
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error("Could not save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  const current = displayList[currentIndex] || displayList[0] || testimonials[0];

  return (
    <section
      id="guest-testimonials-section"
      className="relative overflow-hidden bg-card/60 py-24 border-y border-border/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Subtle Ambience Glow */}
      <div className="pointer-events-none absolute -top-48 -right-48 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container-x relative">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <div>
            <span className="eyebrow text-muted-foreground flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              Guest Satisfaction & Verified Reviews
            </span>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl text-foreground">
              Voices of Banky Hotel
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Real impressions and certified ratings from business executives, wedding couples, and
              families who made Banky Hotel & Suites their sanctuary in Ado-Ekiti.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="open-review-modal-btn"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Share Your Review</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                id="prev-testimonial-btn"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition-colors hover:bg-muted active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                id="next-testimonial-btn"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition-colors hover:bg-muted active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. GUEST SATISFACTION SCORES GRID */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SATISFACTION_SCORES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                id={`satisfaction-score-${idx}`}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-foreground">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-display text-xl font-bold text-foreground">
                      {item.score}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/{item.max}</span>
                  </div>
                </div>

                {/* Progress Metric Bar */}
                <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <p className="mt-2.5 text-[11px] leading-normal text-muted-foreground">
                  {item.highlight}
                </p>
              </div>
            );
          })}
        </div>

        {/* Overall Benchmark Summary Banner */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold text-foreground">4.9 / 5.0</span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Top 1% in Ekiti State
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                98% of guests recommend Banky Hotel & Suites for hospitality and comfort.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Reviews" },
              { id: "executive", label: "Executive Stays" },
              { id: "events", label: "Weddings & Events" },
              { id: "dining", label: "Dining & Bar" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ROTATING TESTIMONIAL CAROUSEL CARD */}
        <div className="relative mx-auto max-w-4xl">
          <div
            id={`testimonial-card-${current.id}`}
            className="relative rounded-3xl border border-white/40 dark:border-white/10 bg-background/90 p-8 sm:p-12 shadow-xl backdrop-blur-xl transition-all duration-500"
          >
            <Quote className="absolute top-6 right-8 h-16 w-16 text-muted/20 pointer-events-none" />

            {/* Rating Stars & Verified Stay Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < current.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {current.rating}.0 / 5.0 Exceptional
                </span>
              </div>

              {current.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Guest Stay
                </span>
              )}
            </div>

            {/* Testimonial Quote */}
            <blockquote className="mt-6 text-lg sm:text-2xl font-normal leading-relaxed text-foreground">
              "{current.content}"
            </blockquote>

            {/* Author Info & Room Experience */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-lg">
                  {current.guest_name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">{current.guest_name}</h3>
                  <p className="text-xs text-muted-foreground">{current.location}</p>
                </div>
              </div>

              <div className="rounded-full border border-border/80 bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                {current.stay_type}
              </div>
            </div>
          </div>

          {/* Dots Indicator & Autoplay Progress */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {displayList.map((t, idx) => (
              <button
                key={t.id}
                id={`dot-testimonial-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-primary"
                    : "w-2 bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div
          id="write-review-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-background p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="close-review-modal"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 rounded-full bg-muted p-2 text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
                <h3 className="mt-4 font-display text-2xl">Thank You for Your Feedback!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your review has been saved to Banky Hotel & Suites' guest testimonials.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <span className="eyebrow text-muted-foreground">Banky Hotel & Suites</span>
                  <h3 className="mt-1 font-display text-2xl">Share Your Experience</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your impressions help future guests discover our sanctuary in Ado-Ekiti.
                  </p>
                </div>

                {/* Rating Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        id={`star-select-${num}`}
                        onClick={() => setRating(num)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            num <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-medium text-muted-foreground">
                      {rating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Your Full Name
                  </label>
                  <input
                    id="review-author-name"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Dr. Folashade Adeyemi"
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      City / Location
                    </label>
                    <input
                      id="review-author-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lagos, Nigeria"
                      className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Room / Experience
                    </label>
                    <input
                      id="review-stay-type"
                      value={stayType}
                      onChange={(e) => setStayType(e.target.value)}
                      placeholder="e.g. Diplomatic Suite"
                      className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Your Review & Remarks
                  </label>
                  <textarea
                    id="review-content"
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us about the hospitality, comfort of your room, food at the restaurant, or atmosphere at the bar..."
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-review-btn"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-primary py-3 text-center text-xs font-semibold tracking-[0.16em] uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? "Publishing Review..." : "Publish Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
