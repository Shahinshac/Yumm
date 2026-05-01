"use client";

import { RatingStars } from "./RatingStars";

interface AverageRatingProps {
  rating: number;
  reviewCount: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function AverageRating({
  rating,
  reviewCount,
  ratingDistribution,
}: AverageRatingProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-lg">
      <h3 className="text-lg font-bold mb-lg">Ratings & Reviews</h3>

      {/* Average Rating */}
      <div className="flex items-center gap-lg mb-lg pb-lg border-b border-gray-200">
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">{rating.toFixed(1)}</p>
          <RatingStars rating={rating} size="sm" />
          <p className="text-sm text-gray-600 mt-md">{reviewCount} reviews</p>
        </div>

        {/* Rating Distribution */}
        {ratingDistribution && (
          <div className="flex-1 space-y-md">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-md">
                  <span className="text-sm w-10 text-right">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewCount === 0 && (
        <p className="text-center text-gray-600 py-lg">
          No reviews yet. Be the first to review!
        </p>
      )}
    </div>
  );
}
