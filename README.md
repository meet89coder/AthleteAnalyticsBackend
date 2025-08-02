# Athlete Analytics Backend API

A production-grade REST API built with Node.js, Express.js, and PostgreSQL for athlete analytics and management.

## 🚀 Features

- **Complete CRUD Operations** for Users and Tenants
- **JWT Authentication** with role-based access control
- **Input Validation** using Joi schemas
- **Rate Limiting** for API security
- **Comprehensive Error Handling** with structured responses
- **Prisma ORM** for type-safe database access
- **Swagger Documentation** for API endpoints
- **90%+ Test Coverage** with Jest and Supertest
- **TypeScript** for type safety
- **Production-ready Configuration** with environment validation

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston
- **Code Quality:** ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=athlete_analytics
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
ADMIN_RATE_LIMIT_MAX=200
```

### 3. Database Setup

Create the database and run Prisma migrations:

```bash
# Create database
createdb athlete_analytics

# Generate Prisma client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### 4. Build and Start

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🏗 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Database connection
│   ├── env.ts       # Environment validation
│   └── logger.ts    # Winston logger setup
├── controllers/     # Route controllers
│   ├── auth.ts      # Authentication endpoints
│   ├── user.ts      # User CRUD operations
│   └── tenant.ts    # Tenant CRUD operations
├── middleware/      # Custom middleware
│   ├── auth.ts      # JWT authentication & authorization
│   ├── errorHandler.ts # Global error handling
│   ├── rateLimiter.ts  # Rate limiting
│   └── validation.ts   # Request validation
├── models/         # Database models
│   ├── user.ts     # User database operations
│   └── tenant.ts   # Tenant database operations
├── routes/         # Route definitions
│   ├── auth.ts     # Authentication routes
│   ├── user.ts     # User routes
│   └── tenant.ts   # Tenant routes
├── services/       # Business logic
│   ├── auth.ts     # Authentication service
│   ├── user.ts     # User service
│   └── tenant.ts   # Tenant service
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
│   ├── jwt.ts      # JWT utilities
│   └── password.ts # Password utilities
├── validations/    # Joi validation schemas
└── tests/          # Test files
    ├── unit/       # Unit tests
    ├── integration/ # Integration tests
    └── helpers/    # Test utilities
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

#### Users
- `POST /users` - Create user (Admin only)
- `GET /users` - List users with pagination (Admin only)
- `GET /users/:id` - Get user by ID (Admin or owner)
- `PUT /users/:id` - Update user (Admin or owner)
- `PATCH /users/:id/role` - Update user role (Admin only)
- `PATCH /users/:id/password` - Change password (Admin or owner)
- `DELETE /users/:id` - Delete user (Admin only)
- `GET /users/by-uuid/:unique_id` - Get user by UUID

#### Tenants
- `POST /tenants` - Create tenant (Admin only)
- `GET /tenants` - List tenants with pagination
- `GET /tenants/:id` - Get tenant by ID
- `PUT /tenants/:id` - Update tenant (Admin only)
- `PATCH /tenants/:id/status` - Toggle tenant status (Admin only)
- `DELETE /tenants/:id` - Delete tenant (Admin only)

### Swagger Documentation
When running in development mode, visit:
```
http://localhost:3000/api-docs
```

## 🔐 Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt with configurable rounds
- **Rate Limiting** with different limits for different endpoint types
- **Input Validation** for all request data
- **CORS Protection** with configurable origins
- **Security Headers** using Helmet
- **SQL Injection Prevention** using parameterized queries

## 🧪 Testing

The project includes comprehensive test coverage (90%+ required):

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

### Test Structure
- **Unit Tests:** Test individual functions and methods
- **Integration Tests:** Test complete API workflows
- **Database Tests:** Use transactions for isolation
- **Coverage Reports:** Generated in `coverage/` directory

## 📝 Development Scripts

```bash
# Development
npm run dev              # Start with nodemon
npm run build           # Build TypeScript
npm run build:watch     # Build in watch mode

# Database (Prisma)
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:push         # Push schema changes
npm run db:seed         # Seed database with initial data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database and run migrations

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run typecheck       # TypeScript type checking

# Testing
npm test                # Run tests
npm run test:coverage   # Run tests with coverage
npm run test:ci         # Run tests for CI

# Utilities
npm run clean           # Clean build artifacts
```

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t athlete-analytics-api .

# Run container
docker run -p 3000:3000 --env-file .env athlete-analytics-api

# Using docker-compose
docker-compose up -d
```

## 🚀 Deployment

### Environment Variables for Production

Ensure these environment variables are set in production:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret-min-32-chars
```

### Production Checklist

- [ ] Set strong JWT secret (minimum 32 characters)
- [ ] Configure database with SSL
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting for your use case
- [ ] Set up log aggregation
- [ ] Configure health checks
- [ ] Set up monitoring and alerts
- [ ] Enable HTTPS
- [ ] Configure reverse proxy (nginx/Apache)

## 🔄 Database Migrations

The project includes the initial schema in `database/schema.sql`. For future migrations:

1. Create migration files in `database/migrations/`
2. Run migrations manually or integrate with a migration tool
3. Update the schema file as needed

## 📊 Monitoring & Logging

- **Structured Logging** with Winston
- **Request Logging** with Morgan
- **Error Tracking** with detailed error responses
- **Health Check** endpoint at `/api/v1/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure coverage
5. Run linting and formatting
6. Submit a pull request

### Code Standards

- **TypeScript Strict Mode** enabled
- **ESLint** for code quality
- **Prettier** for code formatting
- **90% Test Coverage** minimum required
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the test files for usage examples
- Open an issue for bugs or feature requests

## 🔮 Roadmap

- [ ] Redis integration for session management
- [ ] Rate limiting with Redis backend
- [ ] File upload capabilities
- [ ] Email notification service
- [ ] Advanced filtering and search
- [ ] API versioning strategy
- [ ] GraphQL endpoint
- [ ] Microservices architecture support