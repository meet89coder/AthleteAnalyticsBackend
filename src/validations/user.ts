import Joi from 'joi';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUserSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    'string.pattern.base': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be less than 128 characters long',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('admin', 'coach', 'manager', 'athlete').default('athlete').messages({
    'any.only': 'Role must be one of: admin, coach, manager, athlete',
  }),
  tenant_unique_id: Joi.string().trim().min(1).max(255).required().messages({
    'string.min': 'Tenant unique ID cannot be empty',
    'string.max': 'Tenant unique ID must be less than 255 characters',
    'any.required': 'Tenant unique ID is required',
  }),
  first_name: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'First name cannot be empty',
    'string.max': 'First name must be less than 100 characters',
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Last name cannot be empty',
    'string.max': 'Last name must be less than 100 characters',
    'any.required': 'Last name is required',
  }),
  date_of_birth: Joi.date().iso().max('now').optional().messages({
    'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)',
    'date.max': 'Date of birth cannot be in the future',
  }),
  height: Joi.number().positive().max(300).precision(2).optional().messages({
    'number.positive': 'Height must be a positive number',
    'number.max': 'Height must be less than 300 cm',
  }),
  weight: Joi.number().positive().max(500).precision(2).optional().messages({
    'number.positive': 'Weight must be a positive number',
    'number.max': 'Weight must be less than 500 kg',
  }),
  phone: Joi.string().pattern(phoneRegex).optional().messages({
    'string.pattern.base': 'Invalid phone number format',
  }),
  emergency_contact_name: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Emergency contact name must be less than 200 characters',
  }),
  emergency_contact_number: Joi.string().pattern(phoneRegex).optional().messages({
    'string.pattern.base': 'Invalid emergency contact number format',
  }),
});

export const updateUserSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'First name cannot be empty',
    'string.max': 'First name must be less than 100 characters',
  }),
  last_name: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Last name cannot be empty',
    'string.max': 'Last name must be less than 100 characters',
  }),
  date_of_birth: Joi.date().iso().max('now').optional().messages({
    'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)',
    'date.max': 'Date of birth cannot be in the future',
  }),
  height: Joi.number().positive().max(300).precision(2).optional().messages({
    'number.positive': 'Height must be a positive number',
    'number.max': 'Height must be less than 300 cm',
  }),
  weight: Joi.number().positive().max(500).precision(2).optional().messages({
    'number.positive': 'Weight must be a positive number',
    'number.max': 'Weight must be less than 500 kg',
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Invalid phone number format',
  }),
  emergency_contact_name: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Emergency contact name must be less than 200 characters',
  }),
  emergency_contact_number: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Invalid emergency contact number format',
  }),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'coach', 'manager', 'athlete').required().messages({
    'any.only': 'Role must be one of: admin, coach, manager, athlete',
    'any.required': 'Role is required',
  }),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().optional().messages({
    'string.base': 'Current password must be a string',
  }),
  new_password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must be less than 128 characters long',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

export const userQuerySchema = Joi.object({
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
  role: Joi.string().valid('admin', 'coach', 'manager', 'athlete').optional().messages({
    'any.only': 'Role must be one of: admin, coach, manager, athlete',
  }),
  search: Joi.string().trim().min(1).optional().messages({
    'string.min': 'Search term cannot be empty',
  }),
  sort_by: Joi.string()
    .valid('id', 'email', 'role', 'first_name', 'last_name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only':
        'Sort by must be one of: id, email, role, first_name, last_name, created_at, updated_at',
    }),
  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
});

export const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required',
  }),
});

export const userTenantUniqueIdParamSchema = Joi.object({
  tenant_unique_id: Joi.string().trim().min(1).max(255).required().messages({
    'string.min': 'Tenant unique ID cannot be empty',
    'string.max': 'Tenant unique ID must be less than 255 characters',
    'any.required': 'Tenant unique ID is required',
  }),
});
