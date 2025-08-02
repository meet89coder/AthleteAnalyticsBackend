import { generateToken } from '@/utils/jwt';
import { UserRole } from '@/types/user';

export class AuthHelper {
  generateTestToken(userId: number, email: string, role: UserRole = 'athlete'): string {
    return generateToken({
      userId,
      email,
      role,
    });
  }

  generateAdminToken(): string {
    return this.generateTestToken(1, 'admin@athleteanalytics.com', 'admin');
  }

  generateUserToken(userId: number = 2, email: string = 'user@example.com'): string {
    return this.generateTestToken(userId, email, 'athlete');
  }

  getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  getAdminAuthHeaders(): Record<string, string> {
    return this.getAuthHeaders(this.generateAdminToken());
  }

  getUserAuthHeaders(userId?: number, email?: string): Record<string, string> {
    return this.getAuthHeaders(this.generateUserToken(userId, email));
  }

  generateExpiredToken(): string {
    // Generate a token that's already expired
    const payload = {
      userId: 999,
      email: 'expired@example.com',
      role: 'athlete' as UserRole,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };

    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET);
  }

  generateInvalidToken(): string {
    return 'invalid.jwt.token';
  }
}