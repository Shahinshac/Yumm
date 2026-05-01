"use client";

import { RatingStars } from "./RatingStars";
import { Button } from "./Button";

interface ReviewCardProps {
  id: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ReviewCard({
  id,
  rating,
  comment,
  user,
  createdAt,
  isOwner = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-md">
        <div className="flex items-center gap-md flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {user.avatar || user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(id)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(id)}
              className="text-danger"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-md">
        <RatingStars rating={rating} size="sm" />
      </div>

      {/* Comment */}
      {comment && (
        <p className="text-gray-700 text-sm leading-relaxed">{comment}</p>
      )}
    </div>
  );
}
