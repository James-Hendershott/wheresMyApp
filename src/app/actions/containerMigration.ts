// WHY: Migrate legacy containers to ContainerType system
// WHAT: Map existing container.type strings to ContainerType records and update containerTypeId

"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { CATALOG_BY_NAME } from "@/lib/containerCatalog";

export type MigrationResult = {
  dryRun: boolean;
  totalContainers: number;
  matched: number;
  unmatched: number;
  details: Array<{
    containerId: string;
    containerCode: string;
    legacyType: string;
    matchedTypeName?: string;
    matchedTypeId?: string;
  }>;
};

export async function migrateContainersToTypes(dryRun = true): Promise<MigrationResult> {
  const tx = prisma as any;

  // 1. Fetch all containers that don't have a containerTypeId yet
  const containers = await tx.container.findMany({
    where: { containerTypeId: null },
    select: {
      id: true,
      code: true,
      type: true,
    },
  });

  // 2. Fetch all container types
  const allTypes = await tx.containerType.findMany({
    select: {
      id: true,
      name: true,
      codePrefix: true,
    },
  });

  // Build lookup maps
    const typesByName = new Map(allTypes.map((t: any) => [t.name.toLowerCase(), t as { id: string; name: string; codePrefix: string }]));
    const typesByPrefix = new Map(allTypes.map((t: any) => [t.codePrefix.toLowerCase(), t as { id: string; name: string; codePrefix: string }]));

  const details: MigrationResult["details"] = [];
  let matched = 0;
  let unmatched = 0;

  for (const container of containers) {
    const legacyType = (container.type || "").trim();
    let matchedType: { id: string; name: string } | undefined;

    // Try to match by exact name
      matchedType = typesByName.get(legacyType.toLowerCase()) as { id: string; name: string; codePrefix: string } | undefined;

    // Try to match by code prefix (e.g., TOTE27-1 → TOTE27)
    if (!matchedType && container.code) {
      const parts = container.code.split("-");
      if (parts.length > 0) {
        const prefix = parts[0]?.toUpperCase() || "";
          matchedType = typesByPrefix.get(prefix.toLowerCase()) as { id: string; name: string; codePrefix: string } | undefined;
      }
    }

    // Try catalog fallback
    if (!matchedType) {
      const catalogMatch = CATALOG_BY_NAME.get(legacyType.toLowerCase());
      if (catalogMatch) {
          matchedType = typesByName.get(catalogMatch.name.toLowerCase()) as { id: string; name: string; codePrefix: string } | undefined;
      }
    }

    if (matchedType) {
      matched++;
      details.push({
        containerId: container.id,
        containerCode: container.code || "N/A",
        legacyType,
        matchedTypeName: matchedType.name,
        matchedTypeId: matchedType.id,
      });

      // Apply update if not dry run
      if (!dryRun) {
        await tx.container.update({
          where: { id: container.id },
          data: { containerTypeId: matchedType.id },
        });
      }
    } else {
      unmatched++;
      details.push({
        containerId: container.id,
        containerCode: container.code || "N/A",
        legacyType,
      });
    }
  }

  return {
    dryRun,
    totalContainers: containers.length,
    matched,
    unmatched,
    details,
  };
}
