import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Star as LucideStar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// If you installed date-fns, uncomment below
// import { formatDistanceToNow } from "date-fns";

interface Review {
  ratingId: string;
  rating: number; // 1..5
  review: string;

  // Optional modern comment fields (API may or may not send these yet)
  reviewerName?: string; // e.g., "Sujan Shrestha"
  avatarUrl?: string; // e.g., "https://..."
  createdAt?: string; // ISO date string
}

interface ReviewRatingProps {
  productId: string | null;
  ultraPremium?: boolean; // Set true to enable richer styling/layout
}

const getInitials = (name?: string) => {
  if (!name) return "U"; // Unknown
  const parts = name.trim().split(" ");
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return initials || "U";
};

const formatRelative = (iso?: string) => {
  if (!iso) return "just now";
  try {
    const date = new Date(iso);
    // If using date-fns:
    // return formatDistanceToNow(date, { addSuffix: true });
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "recently";
  }
};

/**
 * Fancy stars that support fractional fill (used for average rating).
 * For per-review stars (integers), we still use this for visual consistency.
 */
const FractionalStars: React.FC<{
  value: number; // e.g., 4.3
  max?: number; // default 5
  size?: number; // px
  className?: string;
}> = ({ value, max = 5, size = 20, className }) => {
  const full = Math.floor(value);
  const fraction = Math.max(0, Math.min(1, value - full));
  const stars = Array.from({ length: max }).map((_, i) => {
    // percent fill for this star
    const percent =
      i < full ? 100 : i === full ? Math.round(fraction * 100) : 0;

    return (
      <div
        key={i}
        className="relative"
        style={{ width: size, height: size }}
        aria-label={`${percent}% filled star`}
      >
        {/* base (empty) */}
        <LucideStar
          className="absolute inset-0 text-gray-300"
          style={{ width: size, height: size }}
        />
        {/* fill layer clipped by width */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <LucideStar
            className="text-yellow-500 fill-yellow-500"
            style={{ width: size, height: size }}
          />
        </div>
      </div>
    );
  });

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>{stars}</div>
  );
};

const ShowReview: React.FC<ReviewRatingProps> = ({
  productId,
  ultraPremium = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        setReviews([]);
        setAverageRating(0);
        setTotalRatings(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-ratings/?product=${productId}`
        );
        const fetchedReviews: Review[] = response.data || [];
        setReviews(fetchedReviews);

        const total = fetchedReviews.length;
        const sum = fetchedReviews.reduce(
          (acc, r) => acc + (Number(r.rating) || 0),
          0
        );
        const avg = total > 0 ? sum / total : 0;
        setAverageRating(avg);
        setTotalRatings(total);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const distribution = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const star = Math.round(Number(r.rating) || 0);
      if (star >= 1 && star <= 5) buckets[star] += 1;
    }
    return buckets;
  }, [reviews]);

  return (
    <Card
      className={[
        "w-full p-6 border rounded-2xl",
        ultraPremium
          ? "bg-gradient-to-br from-white via-white to-gray-50 shadow-xl border-gray-100"
          : "bg-white shadow-lg border-gray-100",
      ].join(" ")}
    >
      {/* Header */}
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Ratings &amp; Reviews
          </h2>
          {totalRatings > 0 && (
            <Badge
              className={
                ultraPremium
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-700"
              }
              variant="outline"
            >
              {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Average Rating + Stars */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold text-yellow-500">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <FractionalStars
                value={averageRating}
                size={24}
                className="mb-1"
              />
              <span className="text-sm text-gray-600">
                based on {totalRatings}{" "}
                {totalRatings === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          {/* Optional premium micro copy */}
          {ultraPremium && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <LucideStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Trusted ratings
              </span>
              <span>•</span>
              <span>Real customers</span>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="mb-8 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percent =
              totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            const indicatorColor =
              star === 5
                ? "bg-green-600"
                : star === 4
                ? "bg-green-400"
                : star === 3
                ? "bg-yellow-500"
                : star === 2
                ? "bg-yellow-300"
                : "bg-red-500";
            return (
              <motion.div
                key={star}
                className="flex items-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="w-12 text-sm text-gray-700 flex items-center gap-1">
                  {star}
                  <LucideStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </span>

                <div className="flex-1 mx-3">
                  <Progress
                    value={percent}
                    classNameIndicator={indicatorColor}
                    className={
                      ultraPremium
                        ? "h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
                        : "h-2 bg-gray-200"
                    }
                  />
                </div>

                <span className="w-10 text-sm text-gray-700 tabular-nums">
                  {count}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Reviews List OR Skeleton */}
        <div className="divide-y max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Skeleton loader */}
          {loading && (
            <div className="py-2 space-y-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && reviews.length === 0 && (
            <p className="text-gray-500 text-center py-6">No reviews yet.</p>
          )}

          {/* Reviews rendered with animated transitions */}
          <AnimatePresence initial={false}>
            {!loading &&
              reviews.map((review) => {
                const name = review.reviewerName || "Anonymous";
                const initials = getInitials(name);
                const time = formatRelative(review.createdAt);

                return (
                  <motion.div
                    key={review.ratingId}
                    className="py-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar
                        className={
                          ultraPremium ? "ring-1 ring-emerald-200" : undefined
                        }
                      >
                        {review.avatarUrl ? (
                          <AvatarImage src={review.avatarUrl} alt={name} />
                        ) : (
                          <AvatarFallback>{initials}</AvatarFallback>
                        )}
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {name}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {time}
                          </span>
                          {ultraPremium && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Per-review star rating */}
                        <div className="mt-1 text-yellow-500 flex items-center">
                          <FractionalStars value={review.rating} size={18} />
                        </div>

                        {/* Review text */}
                        <p className="mt-2 text-gray-800 leading-relaxed">
                          {review.review}
                        </p>

                        {/* Optional premium micro-actions */}
                        {ultraPremium && (
                          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                            <button
                              className="hover:text-gray-700 transition-colors"
                              aria-label="Helpful"
                              type="button"
                            >
                              👍 Helpful
                            </button>
                            <button
                              className="hover:text-gray-700 transition-colors"
                              aria-label="Report"
                              type="button"
                            >
                              ⚑ Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowReview;
