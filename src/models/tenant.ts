import { Prisma, Tenant } from '@/generated/prisma';
import { prisma } from '@/config/prisma';
import {
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantQueryParams,
} from '@/types/tenant';
import { PaginatedResponse } from '@/types/api';

export class TenantModel {
  async findById(id: number): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({
      where: { id },
    });
  }

  async create(tenantData: CreateTenantRequest): Promise<Tenant> {
    return await prisma.tenant.create({
      data: {
        name: tenantData.name,
        city: tenantData.city,
        state: tenantData.state,
        country: tenantData.country,
        description: tenantData.description || null,
        isActive: tenantData.is_active !== undefined ? tenantData.is_active : true,
      },
    });
  }

  async update(id: number, tenantData: UpdateTenantRequest): Promise<Tenant | null> {
    const updateData: Prisma.TenantUpdateInput = {};

    if (tenantData.name !== undefined) {
      updateData.name = tenantData.name;
    }
    if (tenantData.city !== undefined) {
      updateData.city = tenantData.city;
    }
    if (tenantData.state !== undefined) {
      updateData.state = tenantData.state;
    }
    if (tenantData.country !== undefined) {
      updateData.country = tenantData.country;
    }
    if (tenantData.description !== undefined) {
      updateData.description = tenantData.description || null;
    }
    if (tenantData.is_active !== undefined) {
      updateData.isActive = tenantData.is_active;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    try {
      return await prisma.tenant.update({
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

  async updateStatus(id: number, isActive: boolean): Promise<boolean> {
    try {
      await prisma.tenant.update({
        where: { id },
        data: { isActive },
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
      await prisma.tenant.delete({
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

  async findAll(params: TenantQueryParams, includeInactive = false): Promise<PaginatedResponse<Tenant>> {
    const {
      page = 1,
      limit = 20,
      city,
      state,
      country,
      is_active,
      search,
      sort_by = 'createdAt',
      sort_order = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.TenantWhereInput = {};

    // Only show active tenants to non-admin users unless specifically queried
    if (!includeInactive && is_active === undefined) {
      where.isActive = true;
    }

    // Build where conditions
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (is_active !== undefined) {
      where.isActive = is_active;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.TenantOrderByWithRelationInput = {};
    
    // Map API field names to Prisma field names
    const fieldMapping: Record<string, string> = {
      'is_active': 'isActive',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
    };

    const prismaField = fieldMapping[sort_by] || sort_by;
    orderBy[prismaField as keyof Prisma.TenantOrderByWithRelationInput] = sort_order;

    // Execute queries
    const [tenants, totalCount] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: tenants,
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

  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.TenantWhereInput = { name };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const tenant = await prisma.tenant.findFirst({ where });
    return !!tenant;
  }
}