import { prismaService } from '@/config/prisma';

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/athlete_analytics_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'athlete_analytics_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.BCRYPT_ROUNDS = '10'; // Minimum required for validation
process.env.LOG_LEVEL = 'error'; // Reduce test output noise

// Increase test timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce test output noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test database setup
beforeAll(async () => {
  try {
    await prismaService.connect();
    await prismaService.testConnection();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
  }
});

afterAll(async () => {
  try {
    await prismaService.disconnect();
  } catch (error) {
    console.error('Failed to disconnect from test database:', error);
  }
});

// Export prisma service for use in tests
export { prismaService };
