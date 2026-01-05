import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * This module provides a singleton instance of PrismaClient to prevent
 * creating multiple connections during development hot reloads.
 * 
 * In production, a single instance is created and reused.
 * In development, the client is stored on globalThis to survive hot reloads.
 */

// Declare global type for Prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client options
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const,
};

/**
 * Export the Prisma client instance
 * Uses globalThis in development to prevent multiple instances
 */
export const prisma = globalThis.prisma ?? new PrismaClient(prismaClientOptions);

// Store client on globalThis in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Helper function to handle Prisma errors gracefully
 * @param error - The error to handle
 * @returns Formatted error message
 */
export function handlePrismaError(error: unknown): string {
  if (error instanceof Error) {
    // Check for common Prisma errors
    if (error.message.includes('Unique constraint')) {
      return 'This record already exists.';
    }
    if (error.message.includes('Foreign key constraint')) {
      return 'Related record not found.';
    }
    if (error.message.includes('Record not found')) {
      return 'The requested record was not found.';
    }
    return error.message;
  }
  return 'An unexpected database error occurred.';
}

/**
 * Disconnect Prisma client
 * Useful for cleanup in tests or serverless environments
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
