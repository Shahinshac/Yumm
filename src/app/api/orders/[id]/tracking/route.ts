import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// Get order tracking info (delivery partner location, ETA, etc)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const payload = verifyTokenFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate ETA (estimated delivery time)
    const estimatedDelivery = order.estimatedDelivery || new Date(Date.now() + 30 * 60000); // Default 30 min
    const eta = Math.max(0, Math.floor((estimatedDelivery.getTime() - Date.now()) / 60000)); // Minutes remaining

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          deliveryPartner: order.deliveryPartner,
          customer: order.user,
          estimatedDelivery: order.estimatedDelivery,
          etaMinutes: eta,
          restaurantLocation: {
            lat: 0, // Mock coordinates - in real app would come from restaurant
            lng: 0,
          },
          deliveryLocation: {
            lat: 0, // Mock coordinates - in real app would come from delivery partner's phone
            lng: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
