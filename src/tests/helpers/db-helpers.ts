import { PrismaClient, User, Tenant } from '@/generated/prisma';
import { prismaService } from '@/config/prisma';
import { UserRole } from '@/types/user';

export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaService.client;
  }

  async clearAllTables(): Promise<void> {
    // Clear in order to handle foreign key constraints
    await this.prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@athleteanalytics.com', // Keep the admin user
        },
      },
    });

    await this.prisma.tenant.deleteMany({
      where: {
        id: {
          gt: 3, // Keep sample tenants (assuming IDs 1, 2, 3)
        },
      },
    });
  }

  async createTestUser(userData: any = {}): Promise<User> {
    const defaultUser = {
      email: 'test@example.com',
      password: '$2a$04$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBGNtQZzTmYZJO', // test123
      role: 'athlete',
      firstName: 'Test',
      lastName: 'User',
      tenantUniqueId: userData.tenantUniqueId || `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
    };

    return await this.prisma.user.create({
      data: {
        email: defaultUser.email,
        password: defaultUser.password,
        role: defaultUser.role,
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
        tenantUniqueId: defaultUser.tenantUniqueId,
        dateOfBirth: defaultUser.dateOfBirth || null,
        age: defaultUser.age || null,
        height: defaultUser.height || null,
        weight: defaultUser.weight || null,
        phone: defaultUser.phone || null,
        emergencyContactName: defaultUser.emergencyContactName || null,
        emergencyContactNumber: defaultUser.emergencyContactNumber || null,
      },
    });
  }

  async createTestTenant(tenantData: any = {}): Promise<Tenant> {
    const defaultTenant = {
      name: 'Test Tenant',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      description: 'Test Description',
      isActive: true,
      ...tenantData,
    };

    return await this.prisma.tenant.create({
      data: {
        name: defaultTenant.name,
        city: defaultTenant.city,
        state: defaultTenant.state,
        country: defaultTenant.country,
        description: defaultTenant.description,
        isActive: defaultTenant.isActive,
      },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getTenantById(id: number): Promise<Tenant | null> {
    return await this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getAdminUser(): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { role: 'admin' },
    });
  }

  async beginTransaction(): Promise<any> {
    // Prisma handles transactions differently
    // Return a transaction function instead
    return this.prisma;
  }

  async rollbackTransaction(): Promise<void> {
    // With Prisma, we'll use the clearAllTables method instead
    await this.clearAllTables();
  }

  async commitTransaction(): Promise<void> {
    // Prisma auto-commits transactions
    return Promise.resolve();
  }

  async resetDatabase(): Promise<void> {
    // Clear all data and reset to initial state
    await this.clearAllTables();
    
    // Ensure admin user exists
    const adminExists = await this.getUserByEmail('admin@athleteanalytics.com');
    if (!adminExists) {
      await this.createTestUser({
        email: 'admin@athleteanalytics.com',
        password: '$2a$04$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBGNtQZzTmYZJO', // admin123
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        uniqueId: 'admin_user_001',
      });
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}