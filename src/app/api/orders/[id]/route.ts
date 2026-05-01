import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET specific order by ID
export async function GET(
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

    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            address: true,
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

    // Verify the user owns this order or is admin
    if (order.userId !== payload.id && payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - This is not your order" },
        { status: 403 }
      );
    }

    // Format response to match frontend expectations
    const formattedOrder = {
      id: order.id,
      status: order.status,
      total: order.totalPrice,
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      deliveryPartner: order.deliveryPartner,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        image: item.menuItem.image,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
