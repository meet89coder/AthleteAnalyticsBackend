import { Prisma, User } from '@/generated/prisma';
import { prisma } from '@/config/prisma';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserRole,
} from '@/types/user';
import { PaginatedResponse } from '@/types/api';

export class UserModel {
  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByTenantUniqueId(tenantUniqueId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { tenantUniqueId },
    });
  }

  async create(userData: CreateUserRequest & { password_hash: string }): Promise<User> {
    const { password_hash, ...restData } = userData;
    
    // Check if tenant_unique_id already exists
    const existingUser = await this.findByTenantUniqueId(restData.tenant_unique_id);
    if (existingUser) {
      throw new Error('Tenant unique ID already exists');
    }
    
    // Calculate age if date_of_birth is provided
    const age = restData.date_of_birth 
      ? Math.floor((new Date().getTime() - new Date(restData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;
    
    return await prisma.user.create({
      data: {
        email: restData.email,
        password: password_hash,
        role: restData.role || 'athlete',
        firstName: restData.first_name,
        lastName: restData.last_name,
        dateOfBirth: restData.date_of_birth ? new Date(restData.date_of_birth) : null,
        age: age,
        height: restData.height ? new Prisma.Decimal(restData.height) : null,
        weight: restData.weight ? new Prisma.Decimal(restData.weight) : null,
        tenantUniqueId: restData.tenant_unique_id,
        phone: restData.phone || null,
        emergencyContactName: restData.emergency_contact_name || null,
        emergencyContactNumber: restData.emergency_contact_number || null,
      },
    });
  }

  async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
    const updateData: Prisma.UserUpdateInput = {};

    if (userData.first_name !== undefined) {
      updateData.firstName = userData.first_name;
    }
    if (userData.last_name !== undefined) {
      updateData.lastName = userData.last_name;
    }
    if (userData.date_of_birth !== undefined) {
      updateData.dateOfBirth = userData.date_of_birth ? new Date(userData.date_of_birth) : null;
      // Update age when date_of_birth changes
      if (userData.date_of_birth) {
        const age = Math.floor((new Date().getTime() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        updateData.age = age;
      } else {
        updateData.age = null;
      }
    }
    if (userData.height !== undefined) {
      updateData.height = userData.height ? new Prisma.Decimal(userData.height) : null;
    }
    if (userData.weight !== undefined) {
      updateData.weight = userData.weight ? new Prisma.Decimal(userData.weight) : null;
    }
    if (userData.phone !== undefined) {
      updateData.phone = userData.phone || null;
    }
    if (userData.emergency_contact_name !== undefined) {
      updateData.emergencyContactName = userData.emergency_contact_name || null;
    }
    if (userData.emergency_contact_number !== undefined) {
      updateData.emergencyContactNumber = userData.emergency_contact_number || null;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    try {
      return await prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return null; // Record not found
        }
      }
      throw error;
    }
  }

  async updateRole(id: number, role: UserRole): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { role },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return false; // Record not found
        }
      }
      throw error;
    }
  }

  async updatePassword(id: number, password: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { password },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return false; // Record not found
        }
      }
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return false; // Record not found
        }
      }
      throw error;
    }
  }

  async findAll(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sort_by = 'createdAt',
      sort_order = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    // Build where conditions
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    
    // Map API field names to Prisma field names
    const fieldMapping: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
    };

    const prismaField = fieldMapping[sort_by] || sort_by;
    orderBy[prismaField as keyof Prisma.UserOrderByWithRelationInput] = sort_order;

    // Execute queries
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: totalCount,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.UserWhereInput = { email };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findFirst({ where });
    return !!user;
  }
}