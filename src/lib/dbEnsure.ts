// WHY: Defensive DB bootstrap to avoid runtime errors when Prisma schema changes
// WHAT: Ensures container_types table and containers.containerTypeId column exist
// NOTE: Safe to call repeatedly; uses IF NOT EXISTS guards

import { prisma } from "@/lib/prisma";

export async function ensureContainerTypesSchema() {
  try {
    // Create container_types table if missing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as unknown as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "container_types" (
        "id" text PRIMARY KEY,
        "name" text UNIQUE NOT NULL,
        "codePrefix" text NOT NULL,
        "iconKey" text NULL,
        "length" integer NULL,
        "width" integer NULL,
        "height" integer NULL,
        "createdAt" timestamp(3) NOT NULL DEFAULT now(),
        "updatedAt" timestamp(3) NOT NULL DEFAULT now()
      );
    `);

    // Add containerTypeId column if missing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as unknown as any).$executeRawUnsafe(`
      ALTER TABLE "containers"
      ADD COLUMN IF NOT EXISTS "containerTypeId" text NULL;
    `);

    // Add number column if missing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as unknown as any).$executeRawUnsafe(`
      ALTER TABLE "containers"
      ADD COLUMN IF NOT EXISTS "number" integer NULL;
    `);

    // Add FK if missing (check case-insensitively)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as unknown as any).$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname ILIKE 'containers_containertypeid_fkey'
        ) THEN
          ALTER TABLE "containers"
          ADD CONSTRAINT containers_containerTypeId_fkey
          FOREIGN KEY ("containerTypeId") REFERENCES "container_types"("id") ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    // Add index if missing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as unknown as any).$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "containers_containerTypeId_idx"
      ON "containers" ("containerTypeId");
    `);
  } catch (e) {
    // Swallow errors to avoid blocking app; admin page will still show guidance
    console.warn("ensureContainerTypesSchema failed:", e);
  }
}
