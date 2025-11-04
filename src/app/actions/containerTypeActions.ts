// WHY: Server actions to manage Container Types (admin)
// WHAT: Create and list container types with dimensions and icon key

"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// ICON_VALUES kept for historical reference — not required for validation anymore
// import { ICON_VALUES } from "@/lib/iconKeys";

const containerTypeSchema = z.object({
  name: z.string().min(2, "Name required"),
  codePrefix: z
    .string()
    .min(1, "Prefix required")
    .max(12, "Prefix too long")
    .regex(/^[A-Z0-9_-]+$/, "Use A-Z, 0-9, dash or underscore"),
  // Allow any lucide icon name (PascalCase) or our legacy keywords (tote, box, bin, suitcase)
  iconKey: z
    .union([z.string().min(1).max(64), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  // Box dimensions
  length: z.coerce.number().int().positive().optional(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  // Tapered container dimensions
  topLength: z.coerce.number().int().positive().optional(),
  topWidth: z.coerce.number().int().positive().optional(),
  bottomLength: z.coerce.number().int().positive().optional(),
  bottomWidth: z.coerce.number().int().positive().optional(),
});

export type ContainerTypeInput = z.infer<typeof containerTypeSchema>;

export async function createContainerType(formData: FormData) {
  // Ensure schema exists before attempting to create a type
  const { ensureContainerTypesSchema } = await import("@/lib/dbEnsure");
  await ensureContainerTypesSchema();
  const parsed = containerTypeSchema.safeParse({
    name: formData.get("name"),
    codePrefix: (formData.get("codePrefix") || "").toString().toUpperCase(),
    iconKey: (formData.get("iconKey") || undefined) as string | undefined,
    length: formData.get("length") ?? undefined,
    width: formData.get("width") ?? undefined,
    height: formData.get("height") ?? undefined,
    topLength: formData.get("topLength") ?? undefined,
    topWidth: formData.get("topWidth") ?? undefined,
    bottomLength: formData.get("bottomLength") ?? undefined,
    bottomWidth: formData.get("bottomWidth") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    // NOTE: Using 'as any' to avoid TS errors if Prisma Client hasn't been regenerated yet
    const tx = prisma as any;
    await tx.containerType.create({
      data: {
        name: parsed.data.name,
        codePrefix: parsed.data.codePrefix,
        iconKey: parsed.data.iconKey,
        length: parsed.data.length ?? null,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        topLength: parsed.data.topLength ?? null,
        topWidth: parsed.data.topWidth ?? null,
        bottomLength: parsed.data.bottomLength ?? null,
        bottomWidth: parsed.data.bottomWidth ?? null,
      },
    });
    revalidatePath("/admin/container-types");
    return { success: `Type "${parsed.data.name}" created.` };
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Name must be unique" : e?.message;
    return { error: msg || "Failed to create type" };
  }
}

export async function listContainerTypes() {
  // NOTE: Using 'as any' until Prisma Client is regenerated
  const tx = prisma as any;
  try {
    const types = await tx.containerType.findMany({
      orderBy: { name: "asc" },
    });
    return types as Array<{
      id: string;
      name: string;
      codePrefix: string;
      iconKey?: string | null;
      length?: number | null;
      width?: number | null;
      height?: number | null;
      topLength?: number | null;
      topWidth?: number | null;
      bottomLength?: number | null;
      bottomWidth?: number | null;
    }>;
  } catch (e: any) {
    // If the table doesn't exist yet, return an empty list gracefully
    if (/(does not exist|rel\s+"container_types")/i.test(e?.message || "")) {
      return [] as Array<{
        id: string;
        name: string;
        codePrefix: string;
        iconKey?: string | null;
        length?: number | null;
        width?: number | null;
        height?: number | null;
        topLength?: number | null;
        topWidth?: number | null;
        bottomLength?: number | null;
        bottomWidth?: number | null;
      }>;
    }
    throw e;
  }
}

export async function updateContainerType(id: string, formData: FormData) {
  const parsed = containerTypeSchema.safeParse({
    name: formData.get("name"),
    codePrefix: (formData.get("codePrefix") || "").toString().toUpperCase(),
    iconKey: (formData.get("iconKey") || undefined) as string | undefined,
    length: formData.get("length") ?? undefined,
    width: formData.get("width") ?? undefined,
    height: formData.get("height") ?? undefined,
    topLength: formData.get("topLength") ?? undefined,
    topWidth: formData.get("topWidth") ?? undefined,
    bottomLength: formData.get("bottomLength") ?? undefined,
    bottomWidth: formData.get("bottomWidth") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  try {
    const tx = prisma as any;
    await tx.containerType.update({
      where: { id },
      data: {
        name: parsed.data.name,
        codePrefix: parsed.data.codePrefix,
        iconKey: parsed.data.iconKey ?? null,
        length: parsed.data.length ?? null,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        topLength: parsed.data.topLength ?? null,
        topWidth: parsed.data.topWidth ?? null,
        bottomLength: parsed.data.bottomLength ?? null,
        bottomWidth: parsed.data.bottomWidth ?? null,
      },
    });
    revalidatePath("/admin/container-types");
    return { success: `Type "${parsed.data.name}" updated.` };
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Name must be unique" : e?.message;
    return { error: msg || "Failed to update type" };
  }
}

export async function deleteContainerType(id: string) {
  try {
    const tx = prisma as any;
    await tx.containerType.delete({ where: { id } });
    revalidatePath("/admin/container-types");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to delete type" };
  }
}
