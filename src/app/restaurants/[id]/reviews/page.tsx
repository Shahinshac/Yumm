"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewCard } from "@/components/ReviewCard";
import { AverageRating } from "@/components/AverageRating";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  image?: string;
  rating: number;
}

export default function RestaurantReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const restaurantId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (restaurantId) {
      loadData();
    }
  }, [restaurantId, isAuthenticated, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load restaurant details
      const restaurantResult = await apiCall<Restaurant>(
        `/restaurants/${restaurantId}`
      );

      if (restaurantResult.success && restaurantResult.data) {
        setRestaurant(restaurantResult.data);
      }

      // Load reviews
      const reviewsResult = await apiCall<{ data: Review[] }>(
        `/reviews?restaurantId=${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (reviewsResult.success && reviewsResult.data) {
        const allReviews = (reviewsResult.data as any).data || [];
        setReviews(allReviews);

        // Find user's review if exists
        const myReview = allReviews.find((r: Review) => r.user.id === user?.id);
        if (myReview) {
          setUserReview(myReview);
        }
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    if (userReview) {
      // Update existing review
      const result = await apiCall(`/reviews/${userReview.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (result.success) {
        setShowForm(false);
        loadData();
      }
    } else {
      // Create new review
      const result = await apiCall("/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          restaurantId,
          ...data,
        }),
      });

      if (result.success) {
        setShowForm(false);
        loadData();
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const result = await apiCall(`/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (result.success) {
        loadData();
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-md">Restaurant not found</p>
          <Button onClick={() => router.back()}>← Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
          <Link href={`/restaurants/${restaurantId}`} className="btn-outline">
            ← Back to Restaurant
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">{restaurant.name} - Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Review Form */}
            {!userReview && !showForm && (
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                Write a Review
              </Button>
            )}

            {showForm && (
              <ReviewForm
                restaurantId={restaurantId}
                existingReview={
                  userReview
                    ? {
                        id: userReview.id,
                        rating: userReview.rating,
                        comment: userReview.comment,
                      }
                    : undefined
                }
                onSubmit={handleSubmitReview}
                onCancel={() => setShowForm(false)}
              />
            )}

            {userReview && !showForm && (
              <div className="space-y-md">
                <p className="font-semibold text-gray-700">Your Review</p>
                <ReviewCard
                  {...userReview}
                  isOwner={true}
                  onEdit={() => setShowForm(true)}
                  onDelete={() => handleDeleteReview(userReview.id)}
                />
              </div>
            )}

            {/* All Reviews */}
            <div className="space-y-lg">
              <h3 className="text-xl font-bold">
                All Reviews ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet</p>
              ) : (
                <div className="space-y-md">
                  {reviews
                    .filter((r) => r.user.id !== user?.id)
                    .map((review) => (
                      <ReviewCard key={review.id} {...review} />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <AverageRating rating={restaurant.rating} reviewCount={reviews.length} />
          </div>
        </div>
      </div>
    </div>
  );
}
