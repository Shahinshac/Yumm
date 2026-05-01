"use client";

import { useState } from "react";
import { Button } from "./Button";
import { RatingStars } from "./RatingStars";

interface ReviewFormProps {
  restaurantId: string;
  orderId?: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  restaurantId,
  orderId,
  existingReview,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ rating, comment });
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-lg">
      <h3 className="text-lg font-bold mb-lg">
        {existingReview ? "Edit Review" : "Write a Review"}
      </h3>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
          {error}
        </div>
      )}

      {/* Rating Selection */}
      <div className="mb-lg">
        <label className="block font-semibold mb-md">Rating</label>
        <RatingStars
          rating={rating}
          interactive={true}
          onRate={setRating}
          size="lg"
        />
        <p className="text-sm text-gray-600 mt-md">
          {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-lg">
        <label htmlFor="comment" className="block font-semibold mb-md">
          Comments (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="input w-full"
        />
        <p className="text-sm text-gray-600 mt-md">
          {comment.length} / 500 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-md">
        <Button
          type="submit"
          variant="primary"
          disabled={!rating || loading}
          className="flex-1"
        >
          {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
