import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET restaurant's menu items
export async function GET(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "RESTAURANT") {
      return NextResponse.json(
        { error: "Unauthorized - Only restaurants can access this" },
        { status: 403 }
      );
    }

    // Get restaurant ID from user
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: payload.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.menuItem.count({
      where: { restaurantId: restaurant.id },
    });

    return NextResponse.json(
      {
        success: true,
        data: menuItems,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create menu item
export async function POST(req: NextRequest) {
  try {
    const payload = verifyTokenFromHeader(req.headers.get("Authorization"));

    if (!payload || payload.role !== "RESTAURANT") {
      return NextResponse.json(
        { error: "Unauthorized - Only restaurants can create items" },
        { status: 403 }
      );
    }

    const { name, description, price, image, category, isAvailable } = await req.json();

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Get restaurant ID from user
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: payload.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name,
        description: description || null,
        price,
        image: image || null,
        category: category || null,
        isAvailable: isAvailable !== false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
