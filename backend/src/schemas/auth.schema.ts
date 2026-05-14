import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const setPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
