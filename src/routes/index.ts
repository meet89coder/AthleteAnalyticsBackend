import { Router } from 'express';
import userRoutes from './user';
import authRoutes from './auth';
import tenantRoutes from './tenant';
import teamRoutes from './team';
import analyticsRoutes from './analytics';
import { config } from '@/config/env';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/teams', teamRoutes);
router.use('/analytics', analyticsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     version:
 *                       type: string
 *                       example: "v1"
 *                 message:
 *                   type: string
 *                   example: "Service is running"
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: config.API_VERSION,
    },
    message: 'Service is running',
  });
});

export default router;
