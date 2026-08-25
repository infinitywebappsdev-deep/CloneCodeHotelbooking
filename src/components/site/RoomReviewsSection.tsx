import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listRoomReviews, submitRoomReview, RoomReview } from "@/lib/reviews.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  ThumbsUp,
  Sparkles,
  Calendar,
  User,
  X,
} from "lucide-react";

interface RoomReviewsSectionProps {
  roomSlug: string;
  roomName: string;
}

export function RoomReviewsSection({ roomSlug, roomName }: RoomReviewsSectionProps) {
  const queryClient = useQueryClient();
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["room-reviews", roomSlug],
    queryFn: () => listRoomReviews({ data: { slug: roomSlug } }),
  });

  // Calculate rating stats
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      totalReviews > 0
        ? (reviews.filter((r) => r.rating === stars).length / totalReviews) * 100
        : 0,
  }));

  const filteredReviews = filterRating ? reviews.filter((r) => r.rating === filterRating) : reviews;

  return (
    <div className="mt-16 border-t border-border pt-16" id="room-reviews-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-amber-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Guest Feedback
          </span>
          <h3 className="mt-2 font-display text-3xl text-foreground">
            Guest Reviews &amp; Ratings
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Real experiences from guests who stayed in our {roomName}.
          </p>
        </div>

        <Button
          onClick={() => setIsWriteModalOpen(true)}
          className="gap-2 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Write a Review
        </Button>
      </div>

      {/* Ratings Summary Bar */}
      <div className="mt-8 grid gap-6 rounded-2xl border border-border/80 bg-muted/20 p-6 md:grid-cols-[200px_1fr_auto] md:items-center">
        {/* Score block */}
        <div className="flex flex-col items-center justify-center border-b border-border/60 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <div className="font-display text-5xl font-bold text-foreground">{averageRating}</div>
          <div className="mt-2 flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="space-y-1.5 px-0 md:px-4">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              type="button"
              onClick={() => setFilterRating(filterRating === stars ? null : stars)}
              className={`group flex w-full items-center gap-3 text-xs transition-opacity ${
                filterRating && filterRating !== stars ? "opacity-40" : "opacity-100"
              }`}
            >
              <span className="flex w-12 items-center gap-1 font-medium text-foreground">
                {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500 group-hover:bg-amber-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Clear or Stats Tag */}
        <div className="flex flex-col items-start gap-2 border-t border-border/60 pt-4 md:border-t-0 md:pt-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            100% Authentic Stays
          </div>
          {filterRating && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterRating(null)}
              className="h-7 text-[11px] gap-1"
            >
              Clear Filter ({filterRating}★)
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading verified reviews...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No reviews match the selected filter.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterRating(null)}
              className="mt-3 text-xs"
            >
              Show All Reviews
            </Button>
          </Card>
        ) : (
          filteredReviews.map((review) => <ReviewItem key={review.id} review={review} />)
        )}
      </div>

      {/* Write Review Dialog / Modal */}
      {isWriteModalOpen && (
        <WriteReviewModal
          roomSlug={roomSlug}
          roomName={roomName}
          onClose={() => setIsWriteModalOpen(false)}
          onSuccess={() => {
            setIsWriteModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["room-reviews", roomSlug] });
          }}
        />
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: RoomReview }) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  return (
    <Card className="overflow-hidden border border-border/70 p-6 transition-all hover:border-border">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="ml-1 text-xs font-bold text-foreground">{review.rating}.0</span>
          </div>

          <h4 className="mt-2 font-serif text-base font-bold text-foreground">{review.title}</h4>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(review.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
            {review.guest_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-foreground">{review.guest_name}</span>
            {review.verified && (
              <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified Stay
              </span>
            )}
          </div>
          {review.stay_date && (
            <span className="text-[11px] text-muted-foreground">• {review.stay_date}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!hasLiked) {
              setLikes((prev) => prev + 1);
              setHasLiked(true);
            }
          }}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors ${
            hasLiked
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>Helpful ({likes})</span>
        </button>
      </div>
    </Card>
  );
}

function WriteReviewModal({
  roomSlug,
  roomName,
  onClose,
  onSuccess,
}: {
  roomSlug: string;
  roomName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [stayDate, setStayDate] = useState("August 2026");

  const submitMut = useMutation({
    mutationFn: () =>
      submitRoomReview({
        data: {
          room_slug: roomSlug,
          guest_name: guestName,
          guest_email: guestEmail,
          rating,
          title,
          comment,
          stay_date: stayDate,
        },
      }),
    onSuccess: () => {
      toast.success("Thank you for reviewing your stay! Your feedback is now live.");
      onSuccess();
    },
    onError: (err) => {
      toast.error((err as Error).message || "Failed to submit review. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please give your review a title.");
      return;
    }
    if (!comment.trim() || comment.length < 10) {
      toast.error("Please share at least a sentence about your stay (10+ characters).");
      return;
    }

    submitMut.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-8 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-serif text-xl font-bold">Write a Guest Review</h3>
            <p className="text-xs text-muted-foreground">Share your feedback for {roomName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Your Overall Rating *</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-medium text-foreground">
                {rating === 5 && "Exceptional (5/5)"}
                {rating === 4 && "Very Good (4/5)"}
                {rating === 3 && "Average (3/5)"}
                {rating === 2 && "Needs Improvement (2/5)"}
                {rating === 1 && "Poor (1/5)"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Your Name *</Label>
              <Input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Dr. Folashade Adeyemi"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">When was your stay?</Label>
              <Input
                value={stayDate}
                onChange={(e) => setStayDate(e.target.value)}
                placeholder="e.g. August 2026"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Email Address (Optional / Private)</Label>
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Will not be published publicly"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Review Title *</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Peaceful stay with exceptional service"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Your Experience &amp; Comments *</Label>
            <Textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy about the room, bed comfort, amenities, food, and staff service?"
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitMut.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitMut.isPending}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {submitMut.isPending ? "Submitting..." : "Publish Review"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
