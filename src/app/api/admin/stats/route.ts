import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET admin stats
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    // Get user counts by role
    const totalUsers = await prisma.user.count();
    const customerCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const restaurantCount = await prisma.user.count({ where: { role: "RESTAURANT" } });
    const deliveryCount = await prisma.user.count({ where: { role: "DELIVERY" } });

    // Get order stats
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: "DELIVERED" } });
    const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });

    // Get revenue stats
    const orders = await prisma.order.findMany({
      select: { totalPrice: true },
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get review stats
    const totalReviews = await prisma.review.count();
    const reviews = await prisma.review.findMany({ select: { rating: true } });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });
    const todayOrdersData = await prisma.order.findMany({
      where: { createdAt: { gte: today } },
      select: { totalPrice: true },
    });
    const todayRevenue = todayOrdersData.reduce((sum, order) => sum + order.totalPrice, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalUsers,
          customerCount,
          restaurantCount,
          deliveryCount,
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
          todayOrders,
          todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
