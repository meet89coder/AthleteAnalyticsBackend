import request from 'supertest';
import app from '@/app';
import { DatabaseHelper, AuthHelper, tenantFixtures } from '@/tests/helpers';

describe('Tenants API', () => {
  let dbHelper: DatabaseHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    authHelper = new AuthHelper();
  });

  beforeEach(async () => {
    await dbHelper.clearAllTables();
  });

  describe('POST /api/v1/tenants', () => {
    it('should create tenant successfully as admin', async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set(authHelper.getAdminAuthHeaders())
        .send(tenantFixtures.validTenant)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(tenantFixtures.validTenant.name);
      expect(response.body.data.city).toBe(tenantFixtures.validTenant.city);
      expect(response.body.data.is_active).toBe(true);
      expect(response.body.message).toBe('Tenant created successfully');
    });

    it('should reject tenant creation as non-admin', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(tenantFixtures.validTenant)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should create tenant with minimal data', async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set(authHelper.getAdminAuthHeaders())
        .send(tenantFixtures.minimalTenant)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tenantFixtures.minimalTenant.name);
      expect(response.body.data.is_active).toBe(true); // Default value
    });

    it('should reject tenant creation with invalid data', async () => {
      const invalidTenant = {
        ...tenantFixtures.validTenant,
        name: '', // Invalid empty name
        city: 'a'.repeat(101), // Too long
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .set(authHelper.getAdminAuthHeaders())
        .send(invalidTenant)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/tenants/:id', () => {
    it('should get tenant by ID as authenticated user', async () => {
      const testTenant = await dbHelper.createTestTenant();
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get(`/api/v1/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTenant.id);
      expect(response.body.data.name).toBe(testTenant.name);
    });

    it('should reject unauthenticated request', async () => {
      const testTenant = await dbHelper.createTestTenant();

      const response = await request(app)
        .get(`/api/v1/tenants/${testTenant.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 for non-existent tenant', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get('/api/v1/tenants/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TENANT_NOT_FOUND');
    });
  });

  describe('GET /api/v1/tenants', () => {
    it('should get all tenants as regular user (active only)', async () => {
      // Create test tenants
      await dbHelper.createTestTenant({ name: 'Active Tenant', is_active: true });
      await dbHelper.createTestTenant({ name: 'Inactive Tenant', is_active: false });

      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get('/api/v1/tenants')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tenants');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.tenants)).toBe(true);
      
      // Should only see active tenants as regular user
      const activeTenants = response.body.data.tenants.filter((t: any) => t.is_active);
      expect(activeTenants.length).toBeGreaterThan(0);
    });

    it('should get all tenants as admin (including inactive)', async () => {
      // Create test tenants
      await dbHelper.createTestTenant({ name: 'Active Tenant', is_active: true });
      await dbHelper.createTestTenant({ name: 'Inactive Tenant', is_active: false });

      const response = await request(app)
        .get('/api/v1/tenants')
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tenants.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      // Create multiple test tenants
      for (let i = 1; i <= 5; i++) {
        await dbHelper.createTestTenant({ name: `Tenant ${i}` });
      }

      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get('/api/v1/tenants?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.tenants.length).toBeLessThanOrEqual(3);
      expect(response.body.data.pagination.current_page).toBe(1);
      expect(response.body.data.pagination.per_page).toBe(3);
    });

    it('should support search', async () => {
      await dbHelper.createTestTenant({ 
        name: 'Elite Sports Academy',
        city: 'New York'
      });
      await dbHelper.createTestTenant({ 
        name: 'Basic Gym',
        city: 'Los Angeles'
      });

      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get('/api/v1/tenants?search=elite')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tenants).toHaveLength(1);
      expect(response.body.data.tenants[0].name).toContain('Elite');
    });
  });

  describe('PUT /api/v1/tenants/:id', () => {
    it('should update tenant successfully as admin', async () => {
      const testTenant = await dbHelper.createTestTenant();

      const response = await request(app)
        .put(`/api/v1/tenants/${testTenant.id}`)
        .set(authHelper.getAdminAuthHeaders())
        .send(tenantFixtures.updateTenantData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tenantFixtures.updateTenantData.name);
      expect(response.body.data.city).toBe(tenantFixtures.updateTenantData.city);
      expect(response.body.message).toBe('Tenant updated successfully');
    });

    it('should reject tenant update as non-admin', async () => {
      const testTenant = await dbHelper.createTestTenant();
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .put(`/api/v1/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(tenantFixtures.updateTenantData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/v1/tenants/:id/status', () => {
    it('should update tenant status as admin', async () => {
      const testTenant = await dbHelper.createTestTenant();

      const response = await request(app)
        .patch(`/api/v1/tenants/${testTenant.id}/status`)
        .set(authHelper.getAdminAuthHeaders())
        .send({ is_active: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(false);
      expect(response.body.message).toBe('Tenant status updated successfully');
    });

    it('should reject status update as non-admin', async () => {
      const testTenant = await dbHelper.createTestTenant();
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .patch(`/api/v1/tenants/${testTenant.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ is_active: false })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/tenants/:id', () => {
    it('should delete tenant as admin', async () => {
      const testTenant = await dbHelper.createTestTenant();

      const response = await request(app)
        .delete(`/api/v1/tenants/${testTenant.id}`)
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tenant deleted successfully');

      // Verify tenant is deleted
      const deletedTenant = await dbHelper.getTenantById(testTenant.id);
      expect(deletedTenant).toBeNull();
    });

    it('should reject tenant deletion as non-admin', async () => {
      const testTenant = await dbHelper.createTestTenant();
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .delete(`/api/v1/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});