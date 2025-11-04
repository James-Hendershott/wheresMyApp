// WHY: Seed standard container types from CONTAINER_CATALOG into the database
// WHAT: Idempotent upsert by unique name; sets codePrefix and iconKey

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CONTAINER_CATALOG } from "@/lib/containerCatalog";

export async function seedContainerTypes() {
  try {
    let created = 0;
    let updated = 0;
    for (const t of CONTAINER_CATALOG) {
      const res = await prisma.containerType.upsert({
        where: { name: t.name },
        update: {
          codePrefix: t.codePrefix,
          iconKey: t.iconKey,
        },
        create: {
          name: t.name,
          codePrefix: t.codePrefix,
          iconKey: t.iconKey,
        },
      });
      // Simple heuristic: if createdAt == updatedAt it was created
      if (res.createdAt.getTime() === res.updatedAt.getTime()) created += 1;
      else updated += 1;
    }
    revalidatePath("/admin/container-types");
    return {
      success: `Seed complete: ${created} created, ${updated} updated.`,
    };
  } catch (e) {
    return { error: String((e as Error).message) };
  }
}
