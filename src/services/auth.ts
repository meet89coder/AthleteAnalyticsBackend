import { UserModel } from '@/models/user';
import { LoginRequest, LoginResponse } from '@/types/auth';
import { User, transformUser } from '@/types/user';
import { comparePassword } from '@/utils/password';
import { generateToken, getTokenExpiration } from '@/utils/jwt';
import { AppError } from '@/middleware/errorHandler';

export class AuthService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    // Get token expiration
    const expiresAt = getTokenExpiration(token);

    const transformedUser = transformUser(user);
    return {
      user: {
        id: transformedUser.id,
        email: transformedUser.email,
        role: transformedUser.role,
        first_name: transformedUser.first_name,
        last_name: transformedUser.last_name,
      },
      token,
      expires_at: expiresAt.toISOString(),
    };
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return transformUser(user);
  }

  async validateUser(userId: number): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    return user ? transformUser(user) : null;
  }
}