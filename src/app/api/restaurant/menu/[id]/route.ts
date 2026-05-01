import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// PATCH update menu item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "RESTAURANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const itemId = params.id;
    const { name, description, price, image, category, isAvailable } = await req.json();

    // Verify the menu item belongs to restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { restaurant: { select: { userId: true } } },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.restaurant.userId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized - This is not your menu item" },
        { status: 403 }
      );
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "RESTAURANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const itemId = params.id;

    // Verify the menu item belongs to restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { restaurant: { select: { userId: true } } },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.restaurant.userId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized - This is not your menu item" },
        { status: 403 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Menu item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
