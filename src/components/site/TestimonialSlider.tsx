import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  MessageSquarePlus,
  X,
  Sparkles,
} from "lucide-react";
import { listTestimonials, submitTestimonial, Testimonial } from "@/lib/testimonials.functions";

export function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // Autoplay Slider
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonials.length, isPaused]);

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !content) return;
    setIsSubmitting(true);
    try {
      await submitTestimonial({
        data: {
          guest_name: guestName,
          location: location || "Nigeria",
          rating,
          content,
          stay_type: stayType,
        },
      });
      setSubmitSuccess(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex] || testimonials[0];

  return (
    <section
      id="guest-testimonials-section"
      className="relative overflow-hidden bg-muted/40 py-24 border-y border-border/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container-x relative">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <div>
            <span className="eyebrow text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Guest Stories & Impressions
            </span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Voices of Banky Hotel</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="open-review-modal-btn"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
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
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                id="next-testimonial-btn"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="rounded-full border border-border bg-background p-2.5 text-foreground transition-colors hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Active Display Card */}
        <div className="relative mx-auto max-w-4xl">
          <div
            id={`testimonial-card-${current.id}`}
            className="relative rounded-2xl border border-white/40 dark:border-white/10 bg-background/80 p-8 sm:p-12 shadow-xl backdrop-blur-xl transition-all duration-500"
          >
            <Quote className="absolute top-6 right-8 h-16 w-16 text-muted/30 dark:text-muted/10 pointer-events-none" />

            {/* Rating Stars */}
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

            {/* Testimonial Quote */}
            <blockquote className="mt-6 text-lg sm:text-2xl font-normal leading-relaxed text-foreground">
              "{current.content}"
            </blockquote>

            {/* Author Info & Stay Details */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-medium text-lg">
                  {current.guest_name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-base">{current.guest_name}</h3>
                    {current.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Guest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{current.location}</p>
                </div>
              </div>

              <div className="rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs text-muted-foreground">
                {current.stay_type}
              </div>
            </div>
          </div>

          {/* Dots Indicator & Autoplay Progress */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                id={`dot-testimonial-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-foreground"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-background p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="close-review-modal"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 rounded-full bg-muted p-2 text-muted-foreground hover:bg-foreground hover:text-background"
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
                    Your Name
                  </label>
                  <input
                    id="review-author-name"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Engr. Babatunde Adeyemi"
                    className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
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
                      className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
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
                      className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
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
                    className="w-full rounded-lg border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-foreground resize-none"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-review-btn"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-primary py-3 text-center text-xs tracking-[0.16em] uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
