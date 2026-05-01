import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET admin analytics
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get orders by status distribution
    const statusDistribution = {
      PENDING: await prisma.order.count({ where: { status: "PENDING" } }),
      CONFIRMED: await prisma.order.count({ where: { status: "CONFIRMED" } }),
      PREPARING: await prisma.order.count({ where: { status: "PREPARING" } }),
      READY: await prisma.order.count({ where: { status: "READY" } }),
      OUT_FOR_DELIVERY: await prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } }),
      DELIVERED: await prisma.order.count({ where: { status: "DELIVERED" } }),
      CANCELLED: await prisma.order.count({ where: { status: "CANCELLED" } }),
    };

    // Get revenue by restaurant (top 10)
    const revenueByRestaurant = await prisma.order.groupBy({
      by: ["restaurantId"],
      _sum: {
        totalPrice: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: 10,
    });

    const restaurantRevenue = await Promise.all(
      revenueByRestaurant.map(async (item) => {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: item.restaurantId },
          select: { name: true },
        });
        return {
          restaurantName: restaurant?.name || "Unknown",
          revenue: item._sum.totalPrice || 0,
          orders: item._count,
        };
      })
    );

    // Get user growth (users created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Get average order value by restaurant
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true },
    });

    const restaurantStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const orders = await prisma.order.findMany({
          where: { restaurantId: restaurant.id },
          select: { totalPrice: true },
        });
        const avgValue = orders.length > 0
          ? orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length
          : 0;
        return {
          name: restaurant.name,
          avgOrderValue: parseFloat(avgValue.toFixed(2)),
          orderCount: orders.length,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          statusDistribution,
          restaurantRevenue,
          newUsers,
          restaurantStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
