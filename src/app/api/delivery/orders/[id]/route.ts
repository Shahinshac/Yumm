import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// POST accept delivery
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "DELIVERY") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "READY") {
      return NextResponse.json(
        { error: "Order is not ready for delivery" },
        { status: 400 }
      );
    }

    if (order.deliveryPartnerId) {
      return NextResponse.json(
        { error: "Order already assigned to another delivery partner" },
        { status: 400 }
      );
    }

    // Update order to assign delivery partner and change status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: payload.id,
        status: "OUT_FOR_DELIVERY",
        estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      },
      include: {
        restaurant: true,
        user: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Delivery accepted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Accept delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH mark delivery complete
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "DELIVERY") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.deliveryPartnerId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized - This is not your delivery" },
        { status: 403 }
      );
    }

    // Mark delivery complete
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: "Delivery completed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
