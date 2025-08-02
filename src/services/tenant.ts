import { TenantModel } from '@/models/tenant';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantQueryParams,
  transformTenant,
} from '@/types/tenant';
import { PaginatedResponse } from '@/types/api';
import { AppError } from '@/middleware/errorHandler';
import { UserRole } from '@/types/user';

export class TenantService {
  private tenantModel: TenantModel;

  constructor() {
    this.tenantModel = new TenantModel();
  }

  async createTenant(tenantData: CreateTenantRequest): Promise<Tenant> {
    // Check if tenant name already exists
    const existingTenant = await this.tenantModel.nameExists(tenantData.name);
    if (existingTenant) {
      throw new AppError('Tenant name already exists', 409, 'TENANT_NAME_EXISTS');
    }

    const createdTenant = await this.tenantModel.create(tenantData);
    return transformTenant(createdTenant);
  }

  async getTenantById(id: number): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id);
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }
    return transformTenant(tenant);
  }

  async updateTenant(id: number, tenantData: UpdateTenantRequest): Promise<Tenant> {
    const existingTenant = await this.tenantModel.findById(id);
    if (!existingTenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    // Check if new name conflicts with existing tenant
    if (tenantData.name && tenantData.name !== existingTenant.name) {
      const nameExists = await this.tenantModel.nameExists(tenantData.name, id);
      if (nameExists) {
        throw new AppError('Tenant name already exists', 409, 'TENANT_NAME_EXISTS');
      }
    }

    const updatedTenant = await this.tenantModel.update(id, tenantData);
    if (!updatedTenant) {
      throw new AppError('Failed to update tenant', 500, 'UPDATE_FAILED');
    }

    return transformTenant(updatedTenant);
  }

  async updateTenantStatus(id: number, isActive: boolean): Promise<void> {
    const existingTenant = await this.tenantModel.findById(id);
    if (!existingTenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    const success = await this.tenantModel.updateStatus(id, isActive);
    if (!success) {
      throw new AppError('Failed to update tenant status', 500, 'UPDATE_FAILED');
    }
  }

  async deleteTenant(id: number): Promise<void> {
    const existingTenant = await this.tenantModel.findById(id);
    if (!existingTenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    const success = await this.tenantModel.delete(id);
    if (!success) {
      throw new AppError('Failed to delete tenant', 500, 'DELETE_FAILED');
    }
  }

  async getAllTenants(
    params: TenantQueryParams,
    userRole: UserRole
  ): Promise<PaginatedResponse<Tenant>> {
    // Admin users can see all tenants, regular users only see active ones
    const includeInactive = userRole === 'admin';
    const result = await this.tenantModel.findAll(params, includeInactive);
    return {
      ...result,
      data: result.data.map(transformTenant),
    };
  }

  async validateTenantExists(id: number): Promise<boolean> {
    const tenant = await this.tenantModel.findById(id);
    return !!tenant;
  }

  async validateTenantNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const exists = await this.tenantModel.nameExists(name, excludeId);
    return !exists;
  }
}
