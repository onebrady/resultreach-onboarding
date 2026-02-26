import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"

/**
 * Generate a secure, URL-safe invite token
 * Format: uuid-randomhex (64 chars total entropy)
 */
export function generateInviteToken(): string {
  const uuid = uuidv4()
  const random = crypto.randomBytes(16).toString("hex")
  return `${uuid}-${random}`
}

/**
 * Calculate token expiry date
 */
export function getTokenExpiry(): Date {
  const days = parseInt(process.env.INVITE_TOKEN_EXPIRY_DAYS || "30", 10)
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt)
}
