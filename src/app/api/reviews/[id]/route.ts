import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// PATCH update review
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviewId = params.id;
    const { rating, comment } = await req.json();

    // Get review to verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== payload.id && payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - You can only edit your own reviews" },
        { status: 403 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate restaurant average rating
    const reviews = await prisma.review.findMany({
      where: { restaurantId: review.restaurantId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.restaurant.update({
      where: { id: review.restaurantId },
      data: { rating: parseFloat(avgRating.toFixed(1)) },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedReview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviewId = params.id;

    // Get review to verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== payload.id && payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate restaurant average rating
    const reviews = await prisma.review.findMany({
      where: { restaurantId: review.restaurantId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.restaurant.update({
      where: { id: review.restaurantId },
      data: { rating: parseFloat(avgRating.toFixed(1)) },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
