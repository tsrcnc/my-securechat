import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash an OTP before storing in database
 */
export async function hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
}

/**
 * Verify an OTP against its hash
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
}

/**
 * Get OTP expiry time (5 minutes from now)
 */
export function getOTPExpiry(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now;
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}
