import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
