// WHY: Server Actions for CRUD on Container (Tote)
// WHAT: Create, update, delete Container using Prisma and Zod

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ContainerStatus } from "@prisma/client";

const containerSchema = z.object({
  code: z.string().min(2, "Code required"),
  label: z.string().min(2, "Label required"),
  description: z.string().optional(),
  status: z.nativeEnum(ContainerStatus).default(ContainerStatus.ACTIVE),
  slotId: z.string().optional(),
  tags: z.string().array().optional(),
  // New optional fields to carry type info without requiring migrations
  typeName: z.string().optional(),
  codePrefix: z.string().optional(),
  suggestedNextNumber: z.string().optional(),
});

export async function createContainer(formData: FormData) {
  const parsed = containerSchema.safeParse({
    code: formData.get("code"),
    label: formData.get("label"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || ContainerStatus.ACTIVE,
    slotId: formData.get("slotId") || undefined,
    tags: formData.getAll("tags") as string[],
    typeName: (formData.get("typeName") || undefined) as string | undefined,
    codePrefix: (formData.get("codePrefix") || undefined) as string | undefined,
    suggestedNextNumber: (formData.get("suggestedNextNumber") || undefined) as string | undefined,
  });
  if (!parsed.success) {
    return { error: "Validation failed: " + parsed.error.errors[0].message };
  }

  // Check for duplicate container code
  const existing = await prisma.container.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { error: "Container already exists with this code. Try again." };
  }

  // Create container, and if slotId provided, ensure the slot is empty and link both sides
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.slotId) {
        const slot = await tx.slot.findUnique({
          where: { id: parsed.data.slotId },
        });
        if (!slot) throw new Error("Selected slot not found");
        if (slot.containerId)
          throw new Error("Selected slot is already occupied");
      }

      // If code was provided, use it. Otherwise, try to build from prefix + next number.
      let codeToUse = parsed.data.code;
      if (!codeToUse && parsed.data.codePrefix && parsed.data.suggestedNextNumber) {
        codeToUse = `${parsed.data.codePrefix}-${Number(parsed.data.suggestedNextNumber)}`;
      }

      const container = await tx.container.create({
        data: {
          code: codeToUse,
          label: parsed.data.label,
          description: parsed.data.description,
          status: parsed.data.status,
          tags: parsed.data.tags,
          currentSlotId: parsed.data.slotId,
          // Legacy string type for now (until migrations add relation/number)
          type: parsed.data.typeName,
        },
      });

      if (parsed.data.slotId) {
        await tx.slot.update({
          where: { id: parsed.data.slotId },
          data: { containerId: container.id },
        });
      }

      return container;
    });
    revalidatePath("/racks");
    return { success: `Container "${result.label}" created successfully!` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create container",
    };
  }
}

export async function updateContainer(id: string, formData: FormData) {
  const parsed = containerSchema.safeParse({
    code: formData.get("code"),
    label: formData.get("label"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || ContainerStatus.ACTIVE,
    slotId: formData.get("slotId") || undefined,
    tags: formData.getAll("tags") as string[],
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  // Update container and adjust slot occupancy if changed
  const updated = await prisma.$transaction(async (tx) => {
    // Find current slot for container
    const existing = await tx.container.findUnique({ where: { id } });
    if (!existing) throw new Error("Container not found");

    // If slotId changed, free previous and occupy new
    if (parsed.data.slotId !== existing.currentSlotId) {
      if (existing.currentSlotId) {
        await tx.slot.update({
          where: { id: existing.currentSlotId },
          data: { containerId: null },
        });
      }
      if (parsed.data.slotId) {
        const newSlot = await tx.slot.findUnique({
          where: { id: parsed.data.slotId },
        });
        if (!newSlot) throw new Error("Selected slot not found");
        if (newSlot.containerId && newSlot.containerId !== id)
          throw new Error("Selected slot is already occupied");
        await tx.slot.update({
          where: { id: parsed.data.slotId },
          data: { containerId: id },
        });
      }
    }

    const container = await tx.container.update({
      where: { id },
      data: {
        code: parsed.data.code,
        label: parsed.data.label,
        description: parsed.data.description,
        status: parsed.data.status,
        tags: parsed.data.tags,
        currentSlotId: parsed.data.slotId ?? null,
      },
    });
    return container;
  });
  revalidatePath("/racks");
  return { container: updated };
}

export async function deleteContainer(id: string) {
  // Clear slot occupancy, then delete
  await prisma.$transaction(async (tx) => {
    const existing = await tx.container.findUnique({ where: { id } });
    if (existing?.currentSlotId) {
      await tx.slot.update({
        where: { id: existing.currentSlotId },
        data: { containerId: null },
      });
    }
    await tx.container.delete({ where: { id } });
  });
  revalidatePath("/racks");
  return { success: true };
}
