import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// POST create order
export async function POST(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { restaurantId, items, notes, deliveryFee = 50, tax = 0 } = await req.json();

    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing restaurant or items" },
        { status: 400 }
      );
    }

    // Calculate total price from items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.id },
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item ${item.id} not found` },
          { status: 404 }
        );
      }

      subtotal += menuItem.price * item.quantity;
      orderItems.push({
        menuItemId: item.id,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    const totalPrice = subtotal + deliveryFee + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: payload.id,
        restaurantId,
        status: "PENDING",
        totalPrice,
        deliveryFee,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        restaurant: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order,
          subtotal,
          tax,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET user's orders
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: payload.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
