import { Pool, QueryResult } from 'pg';
import { pool } from '@/config/database';
import {
  User,
  UserWithPassword,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserRole,
} from '@/types/user';
import { PaginatedResponse } from '@/types/api';

export class UserModel {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, role, first_name, last_name, date_of_birth, 
             CASE 
               WHEN date_of_birth IS NOT NULL 
               THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
               ELSE NULL 
             END as age,
             height, weight, unique_id, phone, emergency_contact_name, 
             emergency_contact_number, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;

    const result: QueryResult = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const query = `
      SELECT id, email, password_hash, role, first_name, last_name, date_of_birth,
             CASE 
               WHEN date_of_birth IS NOT NULL 
               THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
               ELSE NULL 
             END as age,
             height, weight, unique_id, phone, emergency_contact_name, 
             emergency_contact_number, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

    const result: QueryResult = await this.db.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as UserWithPassword;
  }

  async findByUniqueId(uniqueId: string): Promise<User | null> {
    const query = `
      SELECT id, email, role, first_name, last_name, date_of_birth,
             CASE 
               WHEN date_of_birth IS NOT NULL 
               THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
               ELSE NULL 
             END as age,
             height, weight, unique_id, phone, emergency_contact_name, 
             emergency_contact_number, created_at, updated_at
      FROM users 
      WHERE unique_id = $1
    `;

    const result: QueryResult = await this.db.query(query, [uniqueId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  async create(userData: CreateUserRequest & { password_hash: string }): Promise<User> {
    const query = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name, date_of_birth,
        height, weight, phone, emergency_contact_name, emergency_contact_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, role, first_name, last_name, date_of_birth,
                CASE 
                  WHEN date_of_birth IS NOT NULL 
                  THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
                  ELSE NULL 
                END as age,
                height, weight, unique_id, phone, emergency_contact_name, 
                emergency_contact_number, created_at, updated_at
    `;

    const values = [
      userData.email,
      userData.password_hash,
      userData.role || 'user',
      userData.first_name,
      userData.last_name,
      userData.date_of_birth || null,
      userData.height || null,
      userData.weight || null,
      userData.phone || null,
      userData.emergency_contact_name || null,
      userData.emergency_contact_number || null,
    ];

    const result: QueryResult = await this.db.query(query, values);
    return result.rows[0] as User;
  }

  async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(userData).forEach(([key, value]) => {
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
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, role, first_name, last_name, date_of_birth,
                CASE 
                  WHEN date_of_birth IS NOT NULL 
                  THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
                  ELSE NULL 
                END as age,
                height, weight, unique_id, phone, emergency_contact_name, 
                emergency_contact_number, created_at, updated_at
    `;

    const result: QueryResult = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  async updateRole(id: number, role: UserRole): Promise<boolean> {
    const query = 'UPDATE users SET role = $1 WHERE id = $2';
    const result: QueryResult = await this.db.query(query, [role, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2';
    const result: QueryResult = await this.db.query(query, [passwordHash, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result: QueryResult = await this.db.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async findAll(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (role) {
      conditions.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult: QueryResult = await this.db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Data query
    const dataQuery = `
      SELECT id, email, role, first_name, last_name, date_of_birth,
             CASE 
               WHEN date_of_birth IS NOT NULL 
               THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
               ELSE NULL 
             END as age,
             height, weight, unique_id, phone, emergency_contact_name, 
             emergency_contact_number, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);
    const dataResult: QueryResult = await this.db.query(dataQuery, values);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult.rows as User[],
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
    let query = 'SELECT 1 FROM users WHERE email = $1';
    const values: any[] = [email];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result: QueryResult = await this.db.query(query, values);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
