import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '@/types/api';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, string[]> = {};

      error.details.forEach(detail => {
        const field = detail.path.join('.');
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(detail.message);
      });

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      };

      res.status(400).json(response);
      return;
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, string[]> = {};

      error.details.forEach(detail => {
        const field = detail.path.join('.');
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(detail.message);
      });

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details,
        },
      };

      res.status(400).json(response);
      return;
    }

    // Clear existing query properties and assign validated values
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, value);
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, string[]> = {};

      error.details.forEach(detail => {
        const field = detail.path.join('.');
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(detail.message);
      });

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter validation failed',
          details,
        },
      };

      res.status(400).json(response);
      return;
    }

    // Clear existing params properties and assign validated values
    for (const key in req.params) {
      delete req.params[key];
    }
    Object.assign(req.params, value);
    next();
  };
};
