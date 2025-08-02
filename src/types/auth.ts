import { User, UserRole } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Pick<User, 'id' | 'email' | 'role' | 'first_name' | 'last_name'>;
  token: string;
  expires_at: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

