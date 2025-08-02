import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '@/config/env';
import { ApiResponse } from '@/types/api';

const createRateLimitResponse = (retryAfter: number): ApiResponse => ({
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: `Too many requests. Please try again after ${Math.ceil(retryAfter / 1000)} seconds.`,
    details: {
      retryAfter: Math.ceil(retryAfter / 1000),
    },
  },
});

// General rate limiter
export const generalRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    return createRateLimitResponse(retryAfter * 1000);
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    const response = createRateLimitResponse(retryAfter * 1000);
    res.status(429).json(response);
  },
});

// Authentication endpoints rate limiter (stricter)
export const authRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  message: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    return createRateLimitResponse(retryAfter * 1000);
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    const response = createRateLimitResponse(retryAfter * 1000);
    res.status(429).json(response);
  },
  skip: (req: Request) => {
    // Skip rate limiting for certain IPs in development
    if (process.env.NODE_ENV === 'development') {
      const skipIPs = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
      return skipIPs.includes(req.ip!);
    }
    return false;
  },
});

// Admin endpoints rate limiter (more lenient)
export const adminRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.ADMIN_RATE_LIMIT_MAX,
  message: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    return createRateLimitResponse(retryAfter * 1000);
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After') as number;
    const response = createRateLimitResponse(retryAfter * 1000);
    res.status(429).json(response);
  },
});
