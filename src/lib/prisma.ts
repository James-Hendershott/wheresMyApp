// WHY: Ensure a single PrismaClient instance across hot reloads in Next.js
// WHAT: Export a singleton Prisma client attached to globalThis in dev
// HOW: Avoids "Too many connections" and improves DX

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
