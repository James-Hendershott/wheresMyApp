// WHY: Server actions to manage Container Types (admin)
// WHAT: Create and list container types with dimensions and icon key

"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const containerTypeSchema = z.object({
  name: z.string().min(2, "Name required"),
  codePrefix: z
    .string()
    .min(1, "Prefix required")
    .max(12, "Prefix too long")
    .regex(/^[A-Z0-9_-]+$/, "Use A-Z, 0-9, dash or underscore"),
  iconKey: z.string().optional(),
  length: z.coerce.number().int().positive().optional(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
});

export type ContainerTypeInput = z.infer<typeof containerTypeSchema>;

export async function createContainerType(formData: FormData) {
  const parsed = containerTypeSchema.safeParse({
    name: formData.get("name"),
    codePrefix: (formData.get("codePrefix") || "").toString().toUpperCase(),
    iconKey: (formData.get("iconKey") || undefined) as string | undefined,
    length: formData.get("length") ?? undefined,
    width: formData.get("width") ?? undefined,
    height: formData.get("height") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    // NOTE: Using 'as any' to avoid TS errors if Prisma Client hasn't been regenerated yet
    const tx = (prisma as any);
    await tx.containerType.create({
      data: {
        name: parsed.data.name,
        codePrefix: parsed.data.codePrefix,
        iconKey: parsed.data.iconKey,
        length: parsed.data.length ?? null,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
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
  const tx = (prisma as any);
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
  }>;
}
