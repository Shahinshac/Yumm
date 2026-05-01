import bcrypt from "bcryptjs";

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (min 6 chars)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validate name (min 2 chars, no numbers)
 */
export function validateName(name: string): boolean {
  return name.length >= 2 && !/\d/.test(name);
}

/**
 * Validate phone number (basic - digits only, 10+ chars)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Validate address
 */
export function validateAddress(address: string): boolean {
  return address.length >= 10;
}

/**
 * Validate shop name (restaurants)
 */
export function validateShopName(name: string): boolean {
  return name.length >= 3;
}

/**
 * Parse and validate registration data
 */
export function validateRegistrationData(data: any, role: string) {
  const errors: Record<string, string> = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = "Valid email required";
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!data.name || !validateName(data.name)) {
    errors.name = "Name must be at least 2 characters";
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = "Valid phone number required";
  }

  if (role === "RESTAURANT") {
    if (!data.shopName || !validateShopName(data.shopName)) {
      errors.shopName = "Shop name must be at least 3 characters";
    }
    if (!data.address || !validateAddress(data.address)) {
      errors.address = "Address must be at least 10 characters";
    }
  }

  if (role === "DELIVERY") {
    if (!data.phone || !validatePhone(data.phone)) {
      errors.phone = "Phone number required";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
