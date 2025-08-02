import 'module-alias/register';
import app from './app';
import { config } from '@/config/env';
import { logger } from '@/config/logger';
import { prismaService } from '@/config/prisma';

const PORT = config.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connections
    await prismaService.disconnect();
    logger.info('Database connections closed');

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prismaService.connect();
    await prismaService.testConnection();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`API Version: ${config.API_VERSION}`);

      if (config.ENABLE_SWAGGER && config.NODE_ENV !== 'production') {
        logger.info(`Swagger documentation available at: http://localhost:${PORT}/api-docs`);
      }
    });

    // Set server timeout
    server.timeout = 30000; // 30 seconds

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
