import crypto from 'crypto';

/**
 * Generate a 6-digit OTP code.
 */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a unique profile ID in format BPSC-YYYY-XXXXX.
 */
export const generateProfileId = (): string => {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomInt(10000, 99999).toString();
  return `BPSC-${year}-${randomPart}`;
};
