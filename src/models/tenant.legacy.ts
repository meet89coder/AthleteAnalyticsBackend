import { Pool, QueryResult } from 'pg';
import { pool } from '@/config/database';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantQueryParams,
} from '@/types/tenant';
import { PaginatedResponse } from '@/types/api';

export class TenantModel {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  async findById(id: number): Promise<Tenant | null> {
    const query = `
      SELECT id, name, city, state, country, description, is_active, 
             created_at, updated_at
      FROM tenants 
      WHERE id = $1
    `;

    const result: QueryResult = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Tenant;
  }

  async create(tenantData: CreateTenantRequest): Promise<Tenant> {
    const query = `
      INSERT INTO tenants (name, city, state, country, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, city, state, country, description, is_active, 
                created_at, updated_at
    `;

    const values = [
      tenantData.name,
      tenantData.city,
      tenantData.state,
      tenantData.country,
      tenantData.description || null,
      tenantData.is_active !== undefined ? tenantData.is_active : true,
    ];

    const result: QueryResult = await this.db.query(query, values);
    return result.rows[0] as Tenant;
  }

  async update(id: number, tenantData: UpdateTenantRequest): Promise<Tenant | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(tenantData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE tenants 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, city, state, country, description, is_active, 
                created_at, updated_at
    `;

    const result: QueryResult = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Tenant;
  }

  async updateStatus(id: number, isActive: boolean): Promise<boolean> {
    const query = 'UPDATE tenants SET is_active = $1 WHERE id = $2';
    const result: QueryResult = await this.db.query(query, [isActive, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM tenants WHERE id = $1';
    const result: QueryResult = await this.db.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async findAll(
    params: TenantQueryParams,
    includeInactive = false
  ): Promise<PaginatedResponse<Tenant>> {
    const {
      page = 1,
      limit = 20,
      city,
      state,
      country,
      is_active,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Only show active tenants to non-admin users unless specifically queried
    if (!includeInactive && is_active === undefined) {
      conditions.push('is_active = true');
    }

    // Build WHERE conditions
    if (city) {
      conditions.push(`city ILIKE $${paramCount}`);
      values.push(`%${city}%`);
      paramCount++;
    }

    if (state) {
      conditions.push(`state ILIKE $${paramCount}`);
      values.push(`%${state}%`);
      paramCount++;
    }

    if (country) {
      conditions.push(`country ILIKE $${paramCount}`);
      values.push(`%${country}%`);
      paramCount++;
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        name ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR
        city ILIKE $${paramCount} OR
        state ILIKE $${paramCount} OR
        country ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM tenants ${whereClause}`;
    const countResult: QueryResult = await this.db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Data query
    const dataQuery = `
      SELECT id, name, city, state, country, description, is_active, 
             created_at, updated_at
      FROM tenants 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);
    const dataResult: QueryResult = await this.db.query(dataQuery, values);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows as Tenant[],
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
    let query = 'SELECT 1 FROM tenants WHERE name = $1';
    const values: any[] = [name];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result: QueryResult = await this.db.query(query, values);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
