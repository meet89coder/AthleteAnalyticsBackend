import { Request, Response } from 'express';
import { TenantService } from '@/services/tenant';
import { ApiResponse } from '@/types/api';
import {
  CreateTenantRequest,
  UpdateTenantRequest,
  UpdateTenantStatusRequest,
  TenantQueryParams,
} from '@/types/tenant';
import { asyncHandler } from '@/middleware/errorHandler';

export class TenantController {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  createTenant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tenantData: CreateTenantRequest = req.body;
    
    const tenant = await this.tenantService.createTenant(tenantData);

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant created successfully',
    };

    res.status(201).json(response);
  });

  getTenantById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    
    const tenant = await this.tenantService.getTenantById(id);

    const response: ApiResponse = {
      success: true,
      data: tenant,
    };

    res.status(200).json(response);
  });

  getAllTenants = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const queryParams: TenantQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      city: req.query.city as string,
      state: req.query.state as string,
      country: req.query.country as string,
      search: req.query.search as string,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any,
    };

    if (req.query.is_active !== undefined) {
      queryParams.is_active = req.query.is_active === 'true';
    }

    const result = await this.tenantService.getAllTenants(queryParams, reqUser.role);

    const response: ApiResponse = {
      success: true,
      data: {
        tenants: result.data,
        pagination: result.pagination,
      },
    };

    res.status(200).json(response);
  });

  updateTenant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    const tenantData: UpdateTenantRequest = req.body;
    
    const tenant = await this.tenantService.updateTenant(id, tenantData);

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant updated successfully',
    };

    res.status(200).json(response);
  });

  updateTenantStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    const { is_active }: UpdateTenantStatusRequest = req.body;
    
    await this.tenantService.updateTenantStatus(id, is_active);

    const response: ApiResponse = {
      success: true,
      data: { id, is_active },
      message: 'Tenant status updated successfully',
    };

    res.status(200).json(response);
  });

  deleteTenant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id!, 10);
    
    await this.tenantService.deleteTenant(id);

    const response: ApiResponse = {
      success: true,
      message: 'Tenant deleted successfully',
    };

    res.status(200).json(response);
  });
}