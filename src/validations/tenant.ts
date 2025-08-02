import Joi from 'joi';

export const createTenantSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.min': 'Tenant name cannot be empty',
    'string.max': 'Tenant name must be less than 255 characters',
    'any.required': 'Tenant name is required',
  }),
  city: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'City cannot be empty',
    'string.max': 'City must be less than 100 characters',
    'any.required': 'City is required',
  }),
  state: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'State cannot be empty',
    'string.max': 'State must be less than 100 characters',
    'any.required': 'State is required',
  }),
  country: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Country cannot be empty',
    'string.max': 'Country must be less than 100 characters',
    'any.required': 'Country is required',
  }),
  description: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  is_active: Joi.boolean().default(true).messages({
    'boolean.base': 'is_active must be a boolean value',
  }),
});

export const updateTenantSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional().messages({
    'string.min': 'Tenant name cannot be empty',
    'string.max': 'Tenant name must be less than 255 characters',
  }),
  city: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'City cannot be empty',
    'string.max': 'City must be less than 100 characters',
  }),
  state: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'State cannot be empty',
    'string.max': 'State must be less than 100 characters',
  }),
  country: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Country cannot be empty',
    'string.max': 'Country must be less than 100 characters',
  }),
  description: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'is_active must be a boolean value',
  }),
});

export const updateTenantStatusSchema = Joi.object({
  is_active: Joi.boolean().required().messages({
    'boolean.base': 'is_active must be a boolean value',
    'any.required': 'is_active is required',
  }),
});

export const tenantQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must be at most 100',
  }),
  city: Joi.string().trim().min(1).optional().messages({
    'string.min': 'City cannot be empty',
  }),
  state: Joi.string().trim().min(1).optional().messages({
    'string.min': 'State cannot be empty',
  }),
  country: Joi.string().trim().min(1).optional().messages({
    'string.min': 'Country cannot be empty',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'is_active must be a boolean value',
  }),
  search: Joi.string().trim().min(1).optional().messages({
    'string.min': 'Search term cannot be empty',
  }),
  sort_by: Joi.string()
    .valid('id', 'name', 'city', 'state', 'country', 'is_active', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only':
        'Sort by must be one of: id, name, city, state, country, is_active, created_at, updated_at',
    }),
  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
});

export const tenantIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Tenant ID must be a number',
    'number.integer': 'Tenant ID must be an integer',
    'number.positive': 'Tenant ID must be positive',
    'any.required': 'Tenant ID is required',
  }),
});
