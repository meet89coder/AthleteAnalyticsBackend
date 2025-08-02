import Joi from 'joi';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = Joi.object({
  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email format',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Password cannot be empty',
      'any.required': 'Password is required',
    }),
});