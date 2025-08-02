import { Tenant as PrismaTenant } from '@/generated/prisma';

// Transform Prisma Tenant to API Tenant format
export interface Tenant {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantRequest {
  name: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTenantRequest {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTenantStatusRequest {
  is_active: boolean;
}

export interface TenantQueryParams {
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
  search?: string;
  sort_by?: keyof Tenant;
  sort_order?: 'asc' | 'desc';
}

// Transform function to convert Prisma Tenant to API Tenant
export function transformTenant(prismaTenant: PrismaTenant): Tenant {
  const result: any = {
    id: prismaTenant.id,
    name: prismaTenant.name,
    city: prismaTenant.city,
    state: prismaTenant.state,
    country: prismaTenant.country,
    is_active: prismaTenant.isActive,
    created_at: prismaTenant.createdAt.toISOString(),
    updated_at: prismaTenant.updatedAt.toISOString(),
  };

  if (prismaTenant.description) {
    result.description = prismaTenant.description;
  }

  return result;
}