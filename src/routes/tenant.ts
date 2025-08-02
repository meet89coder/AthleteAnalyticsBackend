import { Router } from 'express';
import { TenantController } from '@/controllers/tenant';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import {
  createTenantSchema,
  updateTenantSchema,
  updateTenantStatusSchema,
  tenantQuerySchema,
  tenantIdParamSchema,
} from '@/validations/tenant';
import { adminRateLimit } from '@/middleware/rateLimiter';

const router = Router();
const tenantController = new TenantController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTenantRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tenant name
 *           example: "Sports Club A"
 *         description:
 *           type: string
 *           description: Tenant description
 *           example: "A premier sports club"
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Contact email
 *           example: "contact@sportscluba.com"
 *         contact_phone:
 *           type: string
 *           description: Contact phone number
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           description: Physical address
 *           example: "123 Sports Street, City, State 12345"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Tenant status
 *           example: "active"
 *     UpdateTenantRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Tenant name
 *           example: "Updated Sports Club A"
 *         description:
 *           type: string
 *           description: Tenant description
 *           example: "An updated premier sports club"
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Contact email
 *           example: "updated@sportscluba.com"
 *         contact_phone:
 *           type: string
 *           description: Contact phone number
 *           example: "+1987654321"
 *         address:
 *           type: string
 *           description: Physical address
 *           example: "456 Updated Street, City, State 54321"
 *     UpdateTenantStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: New tenant status
 *           example: "inactive"
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Sports Club A"
 *         description:
 *           type: string
 *           example: "A premier sports club"
 *         contact_email:
 *           type: string
 *           example: "contact@sportscluba.com"
 *         contact_phone:
 *           type: string
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           example: "123 Sports Street, City, State 12345"
 *         status:
 *           type: string
 *           example: "active"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *     TenantsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             tenants:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
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
 *           example: "Tenants retrieved successfully"
 */

/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create a new tenant (Admin only)
 *     description: Create a new tenant in the system. Only administrators can create tenants.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTenantRequest'
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 *                   example: "Tenant created successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validate(createTenantSchema),
  tenantController.createTenant
);

/**
 * @swagger
 * /tenants/{id}:
 *   put:
 *     summary: Update tenant (Admin only)
 *     description: Update a tenant's information. Only administrators can update tenants.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTenantRequest'
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 *                   example: "Tenant updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Tenant not found
 *       429:
 *         description: Rate limit exceeded
 */
router.put(
  '/:id',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateParams(tenantIdParamSchema),
  validate(updateTenantSchema),
  tenantController.updateTenant
);

/**
 * @swagger
 * /tenants/{id}/status:
 *   patch:
 *     summary: Update tenant status (Admin only)
 *     description: Update a tenant's status. Only administrators can change tenant status.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTenantStatusRequest'
 *     responses:
 *       200:
 *         description: Tenant status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 *                   example: "Tenant status updated successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Tenant not found
 *       429:
 *         description: Rate limit exceeded
 */
router.patch(
  '/:id/status',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateParams(tenantIdParamSchema),
  validate(updateTenantStatusSchema),
  tenantController.updateTenantStatus
);

router.delete(
  '/:id',
  adminRateLimit,
  authenticate,
  authorize(['admin']),
  validateParams(tenantIdParamSchema),
  tenantController.deleteTenant
);

// Routes accessible to all authenticated users
/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Get all tenants
 *     description: Retrieve all tenants with pagination and filtering. Accessible to all authenticated users.
 *     tags: [Tenants]
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
 *         description: Search term for filtering tenants
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by tenant status
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantsResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  validateQuery(tenantQuerySchema),
  tenantController.getAllTenants
);

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     description: Retrieve a tenant by their ID. Accessible to all authenticated users.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 *                   example: "Tenant retrieved successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.get(
  '/:id',
  authenticate,
  validateParams(tenantIdParamSchema),
  tenantController.getTenantById
);

export default router;