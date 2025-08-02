import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { UserRole } from '@/types/user';
import { ApiResponse } from '@/types/api';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required',
        },
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token is required',
        },
      };
      res.status(401).json(response);
      return;
    }

    const payload = verifyToken(token);

    (req as any).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error instanceof Error ? error.message : 'Invalid token',
      },
    };
    res.status(401).json(response);
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const reqUser = (req as any).user;
      if (!reqUser) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        };
        res.status(401).json(response);
        return;
      }

      if (!allowedRoles.includes(reqUser.role)) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authorization failed',
        },
      };
      res.status(500).json(response);
    }
  };
};

export const requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const reqUser = (req as any).user;
    if (!reqUser) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      res.status(401).json(response);
      return;
    }

    const resourceUserId = parseInt(req.params.id!, 10);
    const isOwner = reqUser.id === resourceUserId;
    const isAdmin = reqUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own resources',
        },
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authorization failed',
      },
    };
    res.status(500).json(response);
  }
};

// Export types for use in other files
