import { Request, Response } from 'express';
import { AuthService } from '@/services/auth';
import { ApiResponse } from '@/types/api';
import { LoginRequest } from '@/types/auth';
import { asyncHandler } from '@/middleware/errorHandler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loginData: LoginRequest = req.body;

    const result = await this.authService.login(loginData);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    };

    res.status(200).json(response);
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store token in Redis with expiration for blacklisting
    // 3. Use refresh tokens and revoke them
    // For now, we'll just return a success response as the client
    // should remove the token from storage

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const reqUser = (req as any).user;
    if (!reqUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const user = await this.authService.getCurrentUser(reqUser.id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });
}
