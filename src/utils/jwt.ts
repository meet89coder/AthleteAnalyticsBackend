import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import { JWTPayload } from '@/types/auth';
import { UserRole } from '@/types/user';

export const generateToken = (payload: {
  userId: number;
  email: string;
  role: UserRole;
}): string => {
  const jwtPayload: JWTPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  return jwt.sign(jwtPayload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const getTokenExpiration = (token: string): Date => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded) {
      throw new Error('Failed to get token expiration');
    }
    if (!decoded.exp) {
      throw new Error('Token does not have expiration');
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    if (error instanceof Error && error.message === 'Token does not have expiration') {
      throw error;
    }
    // Handle jwt.decode errors for malformed tokens
    throw new Error('Failed to get token expiration');
  }
};
