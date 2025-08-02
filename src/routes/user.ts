import { Router } from 'express';
import { UserController } from '@/controllers/user';
import { authenticate, authorize, requireOwnershipOrAdmin } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  changePasswordSchema,
  userQuerySchema,
  userIdParamSchema,
  userTenantUniqueIdParamSchema,
} from '@/validations/user';
import { adminRateLimit } from '@/middleware/rateLimiter';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           description: User's password
 *           example: "password123"
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         role:
 *           type: string
 *           enum: [athlete, coach, manager, admin]
 *           default: athlete
 *           description: User's role
 *           example: "athlete"
 *         tenant_unique_id:
 *           type: string
 *           description: Tenant-specific unique identifier
 *           example: "TU001"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: "1990-01-01"
 *         height:
 *           type: number
 *           description: User's height in cm
 *           example: 175.5
 *         weight:
 *           type: number
 *           description: User's weight in kg
 *           example: 70.25
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: "+1-555-0123"
 *         emergency_contact_name:
 *           type: string
 *           description: Emergency contact name
 *           example: "Emergency Contact"
 *         emergency_contact_number:
 *           type: string
 *           description: Emergency contact phone number
 *           example: "+1-555-9999"
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "Jane"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Smith"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "jane.smith@example.com"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: "1995-06-15"
 *         height:
 *           type: number
 *           description: User's height in cm
 *           example: 180.0
 *         weight:
 *           type: number
 *           description: User's weight in kg
 *           example: 75.0
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: "+1-555-1234"
 *         emergency_contact_name:
 *           type: string
 *           description: Emergency contact name
 *           example: "Updated Contact"
 *         emergency_contact_number:
 *           type: string
 *           description: Emergency contact phone number
 *           example: "+1-555-8888"
 *     UpdateUserRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [athlete, coach, manager, admin]
 *           description: New user role
 *           example: "admin"
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - current_password
 *         - new_password
 *       properties:
 *         current_password:
 *           type: string
 *           description: Current password
 *           example: "oldpassword123"
 *         new_password:
 *           type: string
 *           minLength: 8
 *           description: New password
 *           example: "newpassword123"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           example: "user"
 *         first_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         tenant_unique_id:
 *           type: string
 *           description: Tenant-specific unique identifier
 *           example: "TU001"
 *         tenant_id:
 *           type: integer
 *           example: 1
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         age:
 *           type: integer
 *           example: 34
 *         height:
 *           type: number
 *           example: 175.5
 *         weight:
 *           type: number
 *           example: 70.25
 *         phone:
 *           type: string
 *           example: "+1-555-0123"
 *         emergency_contact_name:
 *           type: string
 *           example: "Emergency Contact"
 *         emergency_contact_number:
 *           type: string
 *           example: "+1-555-9999"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *     UsersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             pagination:
 *               type: object
 *               properties:
 *                 current_page:
 *                   type: integer
 *                   example: 1
 *                 per_page:
 *                   type: integer
 *                   example: 10
 *                 total_pages:
 *                   type: integer
 *                   example: 5
 *                 total_count:
 *                   type: integer
 *                   example: 50
 *         message:
 *           type: string
 *           example: "Users retrieved successfully"
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     description: Create a new user in the system. Only administrators can create users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Email already exists
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validate(createUserSchema),
  userController.createUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve all users with pagination and filtering. Only administrators can access this endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [athlete, coach, manager, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: integer
 *         description: Filter by tenant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       429:
 *         description: Rate limit exceeded
 */
router.get(
  '/',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateQuery(userQuerySchema),
  userController.getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     description: Delete a user from the system. Only administrators can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 */
router.delete(
  '/:id',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateParams(userIdParamSchema),
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     description: Update a user's role. Only administrators can change user roles.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded
 */
router.patch(
  '/:id/role',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateParams(userIdParamSchema),
  validate(updateUserRoleSchema),
  userController.updateUserRole
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID. Users can only access their own profile, admins can access any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User retrieved successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authenticate,
  requireOwnershipOrAdmin,
  validateParams(userIdParamSchema),
  userController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update a user's information. Users can only update their own profile, admins can update any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 */
router.put(
  '/:id',
  authenticate,
  requireOwnershipOrAdmin,
  validateParams(userIdParamSchema),
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: Change user password
 *     description: Change a user's password. Users can only change their own password, admins can change any user's password.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or invalid current password
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/password',
  authenticate,
  requireOwnershipOrAdmin,
  validateParams(userIdParamSchema),
  validate(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /users/by-tenant-unique-id/{tenant_unique_id}:
 *   get:
 *     summary: Get user by tenant unique ID
 *     description: Retrieve a user by their tenant unique ID. Users can only access their own profile, admins can access any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenant_unique_id
 *         required: true
 *         schema:
 *           type: string
 *           description: Tenant-specific unique identifier
 *           format: uuid
 *         description: User's unique UUID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User retrieved successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: User not found
 */
router.get(
  '/by-tenant-unique-id/:tenant_unique_id',
  authenticate,
  validateParams(userTenantUniqueIdParamSchema),
  userController.getUserByTenantUniqueId
);

export default router;