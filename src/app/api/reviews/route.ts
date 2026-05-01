import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// POST create review
export async function POST(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { restaurantId, rating, comment, orderId } = await req.json();

    if (!restaurantId || !rating) {
      return NextResponse.json(
        { error: "Restaurant ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: payload.id,
        restaurantId,
        rating,
        comment: comment || null,
        orderId: orderId || null,
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

    // Update restaurant average rating
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { rating: parseFloat(avgRating.toFixed(1)) },
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET reviews (with optional filtering)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.review.count({ where });

    return NextResponse.json(
      {
        success: true,
        data: reviews,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
