import { User as PrismaUser } from '@/generated/prisma';

export type UserRole = 'admin' | 'coach' | 'manager' | 'athlete';

// Transform Prisma User to API User format
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
  tenant_unique_id: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: UserRole;
  first_name: string;
  last_name: string;
  tenant_unique_id: string;
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
  current_password?: string;
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

// Transform function to convert Prisma User to API User
export function transformUser(prismaUser: PrismaUser): User {
  const result: any = {
    id: prismaUser.id,
    email: prismaUser.email,
    role: prismaUser.role as UserRole,
    first_name: prismaUser.firstName,
    last_name: prismaUser.lastName,
    tenant_unique_id: prismaUser.tenantUniqueId,
    created_at: prismaUser.createdAt.toISOString(),
    updated_at: prismaUser.updatedAt.toISOString(),
  };

  if (prismaUser.dateOfBirth) {
    result.date_of_birth = prismaUser.dateOfBirth.toISOString().split('T')[0];
  }
  if (prismaUser.age !== null) {
    result.age = prismaUser.age;
  }
  if (prismaUser.height) {
    result.height = Number(prismaUser.height);
  }
  if (prismaUser.weight) {
    result.weight = Number(prismaUser.weight);
  }
  if (prismaUser.phone) {
    result.phone = prismaUser.phone;
  }
  if (prismaUser.emergencyContactName) {
    result.emergency_contact_name = prismaUser.emergencyContactName;
  }
  if (prismaUser.emergencyContactNumber) {
    result.emergency_contact_number = prismaUser.emergencyContactNumber;
  }

  return result;
}

// Transform function with password
export function transformUserWithPassword(prismaUser: PrismaUser): UserWithPassword {
  return {
    ...transformUser(prismaUser),
    password: prismaUser.password,
  };
}