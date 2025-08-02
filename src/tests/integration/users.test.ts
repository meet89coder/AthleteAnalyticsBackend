import request from 'supertest';
import app from '@/app';
import { DatabaseHelper, AuthHelper, userFixtures } from '@/tests/helpers';

describe('Users API', () => {
  let dbHelper: DatabaseHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    authHelper = new AuthHelper();
  });

  beforeEach(async () => {
    await dbHelper.clearAllTables();
  });

  describe('POST /api/v1/users', () => {
    it('should create user successfully as admin', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .send(userFixtures.validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('unique_id');
      expect(response.body.data.email).toBe(userFixtures.validUser.email);
      expect(response.body.data.first_name).toBe(userFixtures.validUser.first_name);
      expect(response.body.data).not.toHaveProperty('password_hash');
      expect(response.body.message).toBe('User created successfully');
    });

    it('should reject user creation as non-admin', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userFixtures.validUser)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject user creation with duplicate email', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .send(userFixtures.validUser);

      // Try to create user with same email
      const response = await request(app)
        .post('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .send(userFixtures.validUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should reject user creation with invalid data', async () => {
      const invalidUser = {
        ...userFixtures.validUser,
        email: 'invalid-email',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveProperty('email');
      expect(response.body.error.details).toHaveProperty('password');
    });

    it('should create user with minimal data', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .send(userFixtures.minimalUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userFixtures.minimalUser.email);
      expect(response.body.data.role).toBe('user'); // Default role
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by ID as admin', async () => {
      const testUser = await dbHelper.createTestUser();

      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should get own user profile as regular user', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
    });

    it('should reject access to other user profile as regular user', async () => {
      const testUser1 = await dbHelper.createTestUser();
      const testUser2 = await dbHelper.createTestUser({ email: 'user2@example.com' });
      const token = authHelper.generateUserToken(testUser1.id, testUser1.email);

      const response = await request(app)
        .get(`/api/v1/users/${testUser2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/999')
        .set(authHelper.getAdminAuthHeaders())
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users as admin', async () => {
      // Create test users
      await dbHelper.createTestUser();
      await dbHelper.createTestUser({ email: 'user2@example.com' });

      const response = await request(app)
        .get('/api/v1/users')
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      // Create multiple test users
      for (let i = 1; i <= 5; i++) {
        await dbHelper.createTestUser({ email: `user${i}@example.com` });
      }

      const response = await request(app)
        .get('/api/v1/users?page=1&limit=3')
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.data.users.length).toBeLessThanOrEqual(3);
      expect(response.body.data.pagination.current_page).toBe(1);
      expect(response.body.data.pagination.per_page).toBe(3);
    });

    it('should support search', async () => {
      await dbHelper.createTestUser({ 
        email: 'john@example.com', 
        first_name: 'John',
        last_name: 'Doe'
      });
      await dbHelper.createTestUser({ 
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith'
      });

      const response = await request(app)
        .get('/api/v1/users?search=john')
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].first_name).toBe('John');
    });

    it('should reject access for non-admin users', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user successfully as admin', async () => {
      const testUser = await dbHelper.createTestUser();

      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set(authHelper.getAdminAuthHeaders())
        .send(userFixtures.updateUserData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe(userFixtures.updateUserData.first_name);
      expect(response.body.data.last_name).toBe(userFixtures.updateUserData.last_name);
      expect(response.body.message).toBe('User updated successfully');
    });

    it('should update own profile as regular user', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(userFixtures.updateUserData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe(userFixtures.updateUserData.first_name);
    });

    it('should reject updating other user profile as regular user', async () => {
      const testUser1 = await dbHelper.createTestUser();
      const testUser2 = await dbHelper.createTestUser({ email: 'user2@example.com' });
      const token = authHelper.generateUserToken(testUser1.id, testUser1.email);

      const response = await request(app)
        .put(`/api/v1/users/${testUser2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(userFixtures.updateUserData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/v1/users/:id/role', () => {
    it('should update user role as admin', async () => {
      const testUser = await dbHelper.createTestUser();

      const response = await request(app)
        .patch(`/api/v1/users/${testUser.id}/role`)
        .set(authHelper.getAdminAuthHeaders())
        .send({ role: 'moderator' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('moderator');
      expect(response.body.message).toBe('User role updated successfully');
    });

    it('should reject role update as non-admin', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .patch(`/api/v1/users/${testUser.id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user as admin', async () => {
      const testUser = await dbHelper.createTestUser();

      const response = await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .set(authHelper.getAdminAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await dbHelper.getUserById(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should reject user deletion as non-admin', async () => {
      const testUser = await dbHelper.createTestUser();
      const token = authHelper.generateUserToken(testUser.id, testUser.email);

      const response = await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});