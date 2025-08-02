import Joi from 'joi';

// Team validation schemas
export const createTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Team name is required',
      'string.max': 'Team name cannot exceed 255 characters',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category is required',
      'string.max': 'Category cannot exceed 100 characters',
    }),

  tenant_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be positive',
    }),

  goals: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Goals cannot exceed 1000 characters',
    }),

  members: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'User ID must be a number',
            'number.integer': 'User ID must be an integer',
            'number.positive': 'User ID must be positive',
          }),

        role: Joi.string()
          .valid('captain', 'co-captain', 'member', 'coach', 'manager')
          .default('member')
          .messages({
            'any.only': 'Role must be one of: captain, co-captain, member, coach, manager',
          }),
      })
    )
    .optional()
    .messages({
      'array.base': 'Members must be an array',
    }),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Team name cannot be empty',
      'string.max': 'Team name cannot exceed 255 characters',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Category cannot be empty',
      'string.max': 'Category cannot exceed 100 characters',
    }),

  goals: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Goals cannot exceed 1000 characters',
    }),
});

// Team member validation schemas
export const addTeamMembersSchema = Joi.object({
  members: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'User ID must be a number',
            'number.integer': 'User ID must be an integer',
            'number.positive': 'User ID must be positive',
          }),

        role: Joi.string()
          .valid('captain', 'co-captain', 'member', 'coach', 'manager')
          .default('member')
          .messages({
            'any.only': 'Role must be one of: captain, co-captain, member, coach, manager',
          }),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.base': 'Members must be an array',
      'array.min': 'At least one member is required',
      'array.max': 'Cannot add more than 50 members at once',
    }),
});

export const updateTeamMemberSchema = Joi.object({
  role: Joi.string()
    .valid('captain', 'co-captain', 'member', 'coach', 'manager')
    .optional()
    .messages({
      'any.only': 'Role must be one of: captain, co-captain, member, coach, manager',
    }),

  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_active must be a boolean',
    }),
});

// Team game validation schemas
export const createTeamGameSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Game name is required',
      'string.max': 'Game name cannot exceed 255 characters',
    }),

  played_on: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': 'played_on must be a valid date',
      'date.format': 'played_on must be in ISO format',
      'date.max': 'Game date cannot be in the future',
    }),

  played_against: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Opponent name is required',
      'string.max': 'Opponent name cannot exceed 255 characters',
    }),

  result: Joi.string()
    .valid('win', 'loss', 'draw')
    .required()
    .messages({
      'any.only': 'Result must be one of: win, loss, draw',
    }),

  description: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
});

export const updateTeamGameSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Game name cannot be empty',
      'string.max': 'Game name cannot exceed 255 characters',
    }),

  result: Joi.string()
    .valid('win', 'loss', 'draw')
    .optional()
    .messages({
      'any.only': 'Result must be one of: win, loss, draw',
    }),

  description: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
});

// Team activity validation schemas
export const createTeamActivitySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Activity name is required',
      'string.max': 'Activity name cannot exceed 255 characters',
    }),

  description: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
});

// Team schedule validation schemas
export const createTeamSchedulesSchema = Joi.object({
  schedules: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .trim()
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.empty': 'Schedule name is required',
            'string.max': 'Schedule name cannot exceed 255 characters',
          }),

        type: Joi.string()
          .valid('game', 'activity', 'session')
          .required()
          .messages({
            'any.only': 'Type must be one of: game, activity, session',
          }),

        description: Joi.string()
          .trim()
          .allow('')
          .max(1000)
          .optional()
          .messages({
            'string.max': 'Description cannot exceed 1000 characters',
          }),

        scheduled_at: Joi.date()
          .iso()
          .min('now')
          .required()
          .messages({
            'date.base': 'scheduled_at must be a valid date',
            'date.format': 'scheduled_at must be in ISO format',
            'date.min': 'Schedule date must be in the future',
          }),

        location: Joi.string()
          .trim()
          .allow('')
          .max(255)
          .optional()
          .messages({
            'string.max': 'Location cannot exceed 255 characters',
          }),
      })
    )
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.base': 'Schedules must be an array',
      'array.min': 'At least one schedule is required',
      'array.max': 'Cannot add more than 20 schedules at once',
    }),
});

export const updateTeamScheduleSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Schedule name cannot be empty',
      'string.max': 'Schedule name cannot exceed 255 characters',
    }),

  scheduled_at: Joi.date()
    .iso()
    .min('now')
    .optional()
    .messages({
      'date.base': 'scheduled_at must be a valid date',
      'date.format': 'scheduled_at must be in ISO format',
      'date.min': 'Schedule date must be in the future',
    }),

  location: Joi.string()
    .trim()
    .allow('')
    .max(255)
    .optional()
    .messages({
      'string.max': 'Location cannot exceed 255 characters',
    }),

  description: Joi.string()
    .trim()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
});

// Query parameter validation schemas
export const teamListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 100 characters',
    }),

  tenant_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be positive',
    }),

  search: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 255 characters',
    }),

  sort_by: Joi.string()
    .valid('name', 'created_at', 'total_members', 'category')
    .default('created_at')
    .messages({
      'any.only': 'sort_by must be one of: name, created_at, total_members, category',
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'sort_order must be either asc or desc',
    }),

  include_inactive: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'include_inactive must be a boolean',
    }),
});

export const teamGameQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  result: Joi.string()
    .valid('win', 'loss', 'draw')
    .optional()
    .messages({
      'any.only': 'Result must be one of: win, loss, draw',
    }),

  from_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'from_date must be in ISO format',
    }),

  to_date: Joi.date()
    .iso()
    .min(Joi.ref('from_date'))
    .optional()
    .messages({
      'date.format': 'to_date must be in ISO format',
      'date.min': 'to_date must be after from_date',
    }),

  sort_by: Joi.string()
    .valid('played_on', 'created_at')
    .default('played_on'),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

export const teamActivityQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  search: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional(),

  sort_by: Joi.string()
    .valid('created_at', 'name')
    .default('created_at'),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

export const teamScheduleQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  type: Joi.string()
    .valid('game', 'activity', 'session')
    .optional()
    .messages({
      'any.only': 'Type must be one of: game, activity, session',
    }),

  upcoming: Joi.boolean()
    .default(false),

  from_date: Joi.date()
    .iso()
    .optional(),

  to_date: Joi.date()
    .iso()
    .min(Joi.ref('from_date'))
    .optional(),

  sort_by: Joi.string()
    .valid('scheduled_at', 'created_at')
    .default('scheduled_at'),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('asc'),
});

export const teamSearchQuerySchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional(),

  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  tenant_id: Joi.number()
    .integer()
    .positive()
    .optional(),

  has_members: Joi.boolean()
    .optional(),

  active_only: Joi.boolean()
    .default(true),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
});

// ID parameter validation
export const teamIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Team ID must be a number',
      'number.integer': 'Team ID must be an integer',
      'number.positive': 'Team ID must be positive',
    }),
});

export const memberIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Member ID must be a number',
      'number.integer': 'Member ID must be an integer',
      'number.positive': 'Member ID must be positive',
    }),

  member_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Member ID must be a number',
      'number.integer': 'Member ID must be an integer',
      'number.positive': 'Member ID must be positive',
    }),
});

export const gameIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),

  game_id: Joi.number()
    .integer()
    .positive()
    .required(),
});

export const scheduleIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),

  schedule_id: Joi.number()
    .integer()
    .positive()
    .required(),
});

// Bulk operations validation
export const bulkTeamOperationSchema = Joi.object({
  operation: Joi.string()
    .valid('create', 'update', 'delete')
    .required()
    .messages({
      'any.only': 'Operation must be one of: create, update, delete',
    }),

  teams: Joi.array()
    .items(
      Joi.when('operation', {
        is: 'create',
        then: createTeamSchema,
        otherwise: Joi.object({
          id: Joi.number().integer().positive().required(),
        }).unknown(true),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one team is required',
      'array.max': 'Cannot process more than 50 teams at once',
    }),
});