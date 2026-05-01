import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get restaurant with menu items and reviews
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: {
          where: { isAvailable: true },
          orderBy: { category: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            category: true,
            isAvailable: true,
          },
        },
        reviews: {
          take: 5, // Get latest 5 reviews
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { reviews: true, orders: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = restaurant.rating || 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...restaurant,
          menuCount: restaurant.menus.length,
          totalReviews: restaurant._count.reviews,
          totalOrders: restaurant._count.orders,
          averageRating: avgRating,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get restaurant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
