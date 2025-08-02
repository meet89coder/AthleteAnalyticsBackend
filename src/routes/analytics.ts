import { Router } from 'express';
import { TeamController } from '../controllers/team';
import { authenticate } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const teamController = new TeamController();

// All analytics routes require authentication
router.use(authenticate);

// User-specific analytics
const userIdSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
});

router.get(
  '/users/:user_id/teams',
  validateParams(userIdSchema),
  teamController.getUserTeams
);

// Tenant-specific analytics
const tenantIdSchema = Joi.object({
  tenant_id: Joi.number().integer().positive().required(),
});

router.get(
  '/tenants/:tenant_id/teams/analytics',
  validateParams(tenantIdSchema),
  teamController.getTenantTeamsAnalytics
);

export default router;