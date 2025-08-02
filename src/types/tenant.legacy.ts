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
