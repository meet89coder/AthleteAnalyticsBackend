import { Request, Response } from 'express';
import { UserService } from '@/services/user';
import { ApiResponse } from '@/types/api';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  ChangePasswordRequest,
  UserQueryParams,
} from '@/types/user';
import { asyncHandler } from '@/middleware/errorHandler';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserRequest = req.body;
    
    const user = await this.userService.createUser(userData);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };

    res.status(201).json(response);
  });

  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    
    const user = await this.userService.getUserById(id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  getUserByTenantUniqueId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tenantUniqueId = req.params.tenant_unique_id!;
    
    const user = await this.userService.getUserByTenantUniqueId(tenantUniqueId);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const queryParams: UserQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      role: req.query.role as any,
      search: req.query.search as string,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any,
    };

    const result = await this.userService.getAllUsers(queryParams);

    const response: ApiResponse = {
      success: true,
      data: {
        users: result.data,
        pagination: result.pagination,
      },
    };

    res.status(200).json(response);
  });

  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    const userData: UpdateUserRequest = req.body;
    
    const user = await this.userService.updateUser(id, userData);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    const { role }: UpdateUserRoleRequest = req.body;
    
    await this.userService.updateUserRole(id, role);

    const response: ApiResponse = {
      success: true,
      data: { id, role },
      message: 'User role updated successfully',
    };

    res.status(200).json(response);
  });

  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    const { current_password, new_password }: ChangePasswordRequest = req.body;
    
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

    await this.userService.changePassword(
      id,
      current_password,
      new_password,
      reqUser.id,
      reqUser.role
    );

    const response: ApiResponse = {
      success: true,
      message: 'Password updated successfully',
    };

    res.status(200).json(response);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    
    await this.userService.deleteUser(id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.status(200).json(response);
  });
}