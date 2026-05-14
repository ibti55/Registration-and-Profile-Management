import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { generateOtp, generateProfileId } from '../utils/helpers';
import { sendOtpEmail } from '../utils/email';
import type { RegisterInput, SetPasswordInput, LoginInput, VerifyOtpInput } from '../schemas/auth.schema';

/**
 * UC-RPM-01 Step 1: Initiate registration by sending OTP
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as RegisterInput;

    // Check if email is already registered
    const existing = await query('SELECT id FROM applicants WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw new AppError('This email is already registered. Please login or use password recovery.', 409);
    }

    // Invalidate any previous unused OTPs for this email
    await query(
      'UPDATE otps SET is_used = TRUE WHERE email = $1 AND is_used = FALSE',
      [email.toLowerCase()]
    );

    // Generate and store OTP
    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await query(
      `INSERT INTO otps (email, otp_code, purpose, expires_at, max_attempts)
       VALUES ($1, $2, 'registration', $3, $4)`,
      [email.toLowerCase(), otp, expiresAt.toISOString(), parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10)]
    );

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. Please verify to continue registration.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-01 Step 2: Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body as VerifyOtpInput;

    const result = await query(
      `SELECT id, otp_code, attempts, max_attempts, expires_at, is_used
       FROM otps
       WHERE email = $1 AND purpose = 'registration' AND is_used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('No pending OTP found. Please request a new one.', 400);
    }

    const otpRecord = result.rows[0];

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      throw new AppError('Maximum OTP attempts exceeded. Please request a new one.', 429);
    }

    // Increment attempts
    await query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      throw new AppError('Invalid OTP. Please try again.', 400);
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Please set your password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-01 Step 3: Set password and create account
 */
export const setPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, password } = req.body as SetPasswordInput;

    // Re-verify OTP
    const otpResult = await query(
      `SELECT id FROM otps
       WHERE email = $1 AND otp_code = $2 AND purpose = 'registration'
         AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), otp]
    );

    if (otpResult.rows.length === 0) {
      throw new AppError('Invalid or expired OTP. Please start registration again.', 400);
    }

    // Check if already registered
    const existing = await query('SELECT id FROM applicants WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw new AppError('Account already exists.', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const profileId = generateProfileId();

    // Create applicant
    const applicantResult = await query(
      `INSERT INTO applicants (email, password_hash, profile_id, email_verified)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, email, profile_id`,
      [email.toLowerCase(), passwordHash, profileId]
    );

    const applicant = applicantResult.rows[0];

    // Mark OTP as used
    await query('UPDATE otps SET is_used = TRUE WHERE id = $1', [otpResult.rows[0].id]);

    // Create empty personal_info record
    await query('INSERT INTO personal_info (applicant_id) VALUES ($1)', [applicant.id]);

    // Create default notification preferences
    await query('INSERT INTO notification_preferences (applicant_id) VALUES ($1)', [applicant.id]);

    // Generate tokens
    const tokenPayload = { id: applicant.id, email: applicant.email, profileId: applicant.profile_id };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token hash
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await query(
      `INSERT INTO refresh_tokens (applicant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [applicant.id, refreshTokenHash]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (applicant_id, action, entity_type, entity_id)
       VALUES ($1, 'REGISTRATION', 'applicant', $2)`,
      [applicant.id, applicant.id]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        profileId: applicant.profile_id,
        email: applicant.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const result = await query(
      'SELECT id, email, password_hash, profile_id, is_active, is_suspended FROM applicants WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password.', 401);
    }

    const applicant = result.rows[0];

    if (!applicant.is_active) {
      throw new AppError('Your account has been deactivated.', 403);
    }

    if (applicant.is_suspended) {
      throw new AppError('Your account has been suspended.', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, applicant.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Update last login
    await query('UPDATE applicants SET last_login_at = NOW() WHERE id = $1', [applicant.id]);

    // Generate tokens
    const tokenPayload = { id: applicant.id, email: applicant.email, profileId: applicant.profile_id };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token hash
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await query(
      `INSERT INTO refresh_tokens (applicant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [applicant.id, refreshTokenHash]
    );

    res.status(200).json({
      success: true,
      data: {
        profileId: applicant.profile_id,
        email: applicant.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 */
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify token exists in DB
    const storedTokens = await query(
      `SELECT id, token_hash FROM refresh_tokens
       WHERE applicant_id = $1 AND is_revoked = FALSE AND expires_at > NOW()`,
      [decoded.id]
    );

    let tokenValid = false;
    for (const stored of storedTokens.rows) {
      if (await bcrypt.compare(refreshToken, stored.token_hash)) {
        tokenValid = true;
        // Revoke old token
        await query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1', [stored.id]);
        break;
      }
    }

    if (!tokenValid) {
      throw new AppError('Invalid refresh token.', 401);
    }

    // Generate new tokens
    const tokenPayload = { id: decoded.id, email: decoded.email, profileId: decoded.profileId };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    await query(
      `INSERT INTO refresh_tokens (applicant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [decoded.id, newRefreshHash]
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout – revoke refresh tokens
 */
export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE applicant_id = $1',
      [req.user.id]
    );

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const result = await query(
      `SELECT a.id, a.email, a.profile_id, a.email_verified, a.created_at,
              p.applicant_name, p.photo_url
       FROM applicants a
       LEFT JOIN personal_info p ON p.applicant_id = a.id
       WHERE a.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Invalidate previous OTPs
    await query(
      'UPDATE otps SET is_used = TRUE WHERE email = $1 AND is_used = FALSE',
      [email.toLowerCase()]
    );

    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await query(
      `INSERT INTO otps (email, otp_code, purpose, expires_at)
       VALUES ($1, $2, 'registration', $3)`,
      [email.toLowerCase(), otp, expiresAt.toISOString()]
    );

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};
