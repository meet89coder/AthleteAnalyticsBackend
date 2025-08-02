export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  age?: number;
  height?: number;
  weight?: number;
  unique_id: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: UserRole;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  height?: number;
  weight?: number;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  height?: number;
  weight?: number;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface ChangePasswordRequest {
  current_password?: string; // Optional for admin changing other user's password
  new_password: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  sort_by?: keyof User;
  sort_order?: 'asc' | 'desc';
}
