"use client";

interface RatingStarsProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  rating,
  interactive = false,
  onRate,
  size = "md",
}: RatingStarsProps) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex gap-xs">
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`${sizeClass} transition-transform ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
