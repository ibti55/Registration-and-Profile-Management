import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  profileId: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'fallback_secret', {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret') as TokenPayload;
};
