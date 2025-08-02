import { generateToken, verifyToken, getTokenExpiration } from '@/utils/jwt';
import { UserRole } from '@/types/user';

describe('JWT Utils', () => {
  const testPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user' as UserRole,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(testPayload);
      const token2 = generateToken({ ...testPayload, userId: 2 });
      
      expect(token1).not.toBe(token2);
    });

    it('should include all required fields in token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw error for invalid token format', () => {
      expect(() => verifyToken('invalid.token')).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not.a.token.at.all')).toThrow('Invalid token');
    });

    it('should throw error for token with wrong secret', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithWrongSecret = jwt.sign(testPayload, 'wrong-secret');
      
      expect(() => verifyToken(tokenWithWrongSecret)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { ...testPayload, exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      );
      
      expect(() => verifyToken(expiredToken)).toThrow('Token has expired');
    });
  });

  describe('getTokenExpiration', () => {
    it('should return correct expiration date', () => {
      const token = generateToken(testPayload);
      const expiration = getTokenExpiration(token);
      
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error for token without expiration', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithoutExp = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        process.env.JWT_SECRET
      );
      
      expect(() => getTokenExpiration(tokenWithoutExp)).toThrow('Token does not have expiration');
    });

    it('should throw error for invalid token', () => {
      expect(() => getTokenExpiration('invalid.token')).toThrow('Failed to get token expiration');
    });
  });
});