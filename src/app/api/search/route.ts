import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // all, restaurants, items

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results: any = {
      restaurants: [],
      items: [],
    };

    // Search restaurants
    if (type === "all" || type === "restaurants") {
      const restaurants = await prisma.restaurant.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          rating: true,
          address: true,
        },
      });
      results.restaurants = restaurants;
    }

    // Search menu items
    if (type === "all" || type === "items") {
      const items = await prisma.menuItem.findMany({
        where: {
          isAvailable: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              rating: true,
            },
          },
        },
      });
      results.items = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        restaurant: item.restaurant,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        query,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
