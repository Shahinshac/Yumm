import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET restaurant analytics
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "RESTAURANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get restaurant ID from user
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: payload.id },
      select: { id: true, rating: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get orders data
    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      select: {
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    });

    // Get reviews data
    const reviews = await prisma.review.findMany({
      where: { restaurantId: restaurant.id },
      select: { rating: true },
    });

    // Get menu items count
    const menuItemsCount = await prisma.menuItem.count({
      where: { restaurantId: restaurant.id },
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const completedOrders = orders.filter(o => o.status === "DELIVERED").length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalOrders,
          completedOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
          avgRating: parseFloat(avgRating.toFixed(1)),
          menuItemsCount,
          reviewsCount: reviews.length,
          todayOrders: todayOrders.length,
          todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
