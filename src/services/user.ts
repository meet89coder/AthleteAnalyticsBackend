import { UserModel } from '@/models/user';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserRole,
  transformUser,
  transformUserWithPassword,
} from '@/types/user';
import { PaginatedResponse } from '@/types/api';
import { hashPassword, comparePassword } from '@/utils/password';
import { AppError } from '@/middleware/errorHandler';

export class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const userDataWithHash = {
      ...userData,
      password_hash: passwordHash,
    };

    const createdUser = await this.userModel.create(userDataWithHash);
    return transformUser(createdUser);
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return transformUser(user);
  }

  async getUserByTenantUniqueId(tenantUniqueId: string): Promise<User> {
    const user = await this.userModel.findByTenantUniqueId(tenantUniqueId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return transformUser(user);
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const updatedUser = await this.userModel.update(id, userData);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500, 'UPDATE_FAILED');
    }

    return transformUser(updatedUser);
  }

  async updateUserRole(id: number, role: UserRole): Promise<void> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const success = await this.userModel.updateRole(id, role);
    if (!success) {
      throw new AppError('Failed to update user role', 500, 'UPDATE_FAILED');
    }
  }

  async changePassword(
    id: number,
    currentPassword: string | undefined,
    newPassword: string,
    requestingUserId: number,
    requestingUserRole: UserRole
  ): Promise<void> {
    const userWithPassword = await this.userModel.findById(id);

    if (!userWithPassword) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If not admin and trying to change another user's password, deny
    if (requestingUserRole !== 'admin' && requestingUserId !== id) {
      throw new AppError('You can only change your own password', 403, 'FORBIDDEN');
    }

    // If user is changing their own password, verify current password
    if (requestingUserId === id && currentPassword) {
      const userWithHash = await this.userModel.findByEmail(userWithPassword.email);
      if (!userWithHash) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const isCurrentPasswordValid = await comparePassword(currentPassword, userWithHash.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
      }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const success = await this.userModel.updatePassword(id, newPasswordHash);
    if (!success) {
      throw new AppError('Failed to update password', 500, 'UPDATE_FAILED');
    }
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const success = await this.userModel.delete(id);
    if (!success) {
      throw new AppError('Failed to delete user', 500, 'DELETE_FAILED');
    }
  }

  async getAllUsers(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    const result = await this.userModel.findAll(params);
    return {
      ...result,
      data: result.data.map(transformUser),
    };
  }

  async validateUserExists(id: number): Promise<boolean> {
    const user = await this.userModel.findById(id);
    return !!user;
  }

  async validateEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    const exists = await this.userModel.emailExists(email, excludeId);
    return !exists;
  }
}
