import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET delivery partner earnings
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "DELIVERY") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all completed deliveries for this partner
    const deliveredOrders = await prisma.order.findMany({
      where: {
        deliveryPartnerId: payload.id,
        status: "DELIVERED",
      },
      select: {
        id: true,
        deliveryFee: true,
        createdAt: true,
      },
    });

    // Get active delivery
    const activeDelivery = await prisma.order.findFirst({
      where: {
        deliveryPartnerId: payload.id,
        status: "OUT_FOR_DELIVERY",
      },
      select: {
        id: true,
        deliveryFee: true,
      },
    });

    // Calculate earnings
    const totalEarnings = deliveredOrders.reduce(
      (sum, order) => sum + order.deliveryFee,
      0
    );

    const completedDeliveries = deliveredOrders.length;
    const activeDeliveries = activeDelivery ? 1 : 0;

    // Get today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = deliveredOrders.filter(
      (o) => new Date(o.createdAt) >= today
    );
    const todayEarnings = todayOrders.reduce(
      (sum, order) => sum + order.deliveryFee,
      0
    );

    // Get this week's earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = deliveredOrders.filter(
      (o) => new Date(o.createdAt) >= weekAgo
    );
    const weekEarnings = weekOrders.reduce(
      (sum, order) => sum + order.deliveryFee,
      0
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          todayEarnings: parseFloat(todayEarnings.toFixed(2)),
          weekEarnings: parseFloat(weekEarnings.toFixed(2)),
          completedDeliveries,
          activeDeliveries,
          averageEarningsPerDelivery:
            completedDeliveries > 0
              ? parseFloat((totalEarnings / completedDeliveries).toFixed(2))
              : 0,
          recentDeliveries: deliveredOrders.slice(0, 10),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get earnings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
