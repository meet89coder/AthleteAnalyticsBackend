import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, requireOwnershipOrAdmin } from '@/middleware/auth';
import { AuthHelper } from '@/tests/helpers';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let authHelper: AuthHelper;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    authHelper = new AuthHelper();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', () => {
      const token = authHelper.generateUserToken();
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(2);
      expect(mockRequest.user?.email).toBe('user@example.com');
    });

    it('should reject request without authorization header', () => {
      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization header format', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token is required',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid.token' };

      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', () => {
      const expiredToken = authHelper.generateExpiredToken();
      mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

      authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token has expired',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 1,
        email: 'user@example.com',
        role: 'athlete',
      };
    });

    it('should allow access for user with correct role', () => {
      const middleware = authorize(['athlete', 'admin']);

      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for user with incorrect role', () => {
      const middleware = authorize(['admin']);

      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', () => {
      mockRequest.user = undefined;
      const middleware = authorize(['athlete']);

      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow admin access to admin-only endpoints', () => {
      mockRequest.user = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
      };
      const middleware = authorize(['admin']);

      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnershipOrAdmin', () => {
    beforeEach(() => {
      mockRequest.params = { id: '2' };
    });

    it('should allow user to access their own resource', () => {
      mockRequest.user = {
        id: 2,
        email: 'user@example.com',
        role: 'athlete',
      };

      requireOwnershipOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow admin to access any resource', () => {
      mockRequest.user = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
      };

      requireOwnershipOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny user access to another user\'s resource', () => {
      mockRequest.user = {
        id: 3,
        email: 'otheruser@example.com',
        role: 'athlete',
      };

      requireOwnershipOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own resources',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', () => {
      mockRequest.user = undefined;

      requireOwnershipOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});