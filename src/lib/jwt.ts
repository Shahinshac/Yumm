import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production";

export interface TokenPayload {
  id: string;
  email: string;
  role: "CUSTOMER" | "RESTAURANT" | "DELIVERY" | "ADMIN";
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn } as any);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate refresh token (longer expiration)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" } as any);
}

/**
 * Extract token from authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7); // Remove "Bearer " prefix
}

/**
 * Verify token from request header
 */
export function verifyTokenFromHeader(authHeader: string | null | undefined): TokenPayload | null {
  const token = extractTokenFromHeader(authHeader || undefined);
  return token ? verifyToken(token) : null;
}
