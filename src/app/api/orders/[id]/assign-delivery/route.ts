import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// Assign delivery partner to order
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const payload = verifyTokenFromHeader(authHeader);

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Only admins can assign deliveries" },
        { status: 403 }
      );
    }

    const { deliveryPartnerId } = await req.json();

    if (!deliveryPartnerId) {
      return NextResponse.json(
        { error: "Delivery partner ID is required" },
        { status: 400 }
      );
    }

    const orderId = params.id;

    // Verify delivery partner exists
    const deliveryPartner = await prisma.user.findUnique({
      where: { id: deliveryPartnerId },
      select: { id: true, role: true },
    });

    if (!deliveryPartner || deliveryPartner.role !== "DELIVERY") {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    // Update order with delivery partner
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId,
        status: "OUT_FOR_DELIVERY",
      },
      include: {
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assign delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
