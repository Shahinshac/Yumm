import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const sortBy = searchParams.get("sortBy") || "rating"; // rating, name, newest

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for filters
    const whereClause: any = {
      isActive: true,
    };

    // Search by name or description
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by category if menu items have category
    // (simplified - in production might need separate category table)
    if (category) {
      whereClause.menus = {
        some: {
          category: { contains: category, mode: "insensitive" },
        },
      };
    }

    // Filter by minimum rating
    if (minRating > 0) {
      whereClause.rating = { gte: minRating };
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
      default:
        orderBy = { rating: "desc" };
        break;
    }

    // Get total count for pagination
    const total = await prisma.restaurant.count({ where: whereClause });

    // Get restaurants with pagination and sorting
    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        rating: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { menus: true, reviews: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: restaurants.map((r) => ({
          ...r,
          menuCount: r._count.menus,
          reviewCount: r._count.reviews,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get restaurants error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
