// WHY: Server Actions for CRUD on Container (Tote)
// WHAT: Create, update, delete Container using Prisma and Zod

"use server";
import { z } from "zod";
import { PrismaClient, ContainerStatus } from "@prisma/client";

const prisma = new PrismaClient();

const containerSchema = z.object({
  code: z.string().min(2, "Code required"),
  label: z.string().min(2, "Label required"),
  description: z.string().optional(),
  status: z.nativeEnum(ContainerStatus).default(ContainerStatus.ACTIVE),
  slotId: z.string().optional(),
  tags: z.string().array().optional(),
});

export async function createContainer(formData: FormData) {
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
  const container = await prisma.container.create({
    data: {
      code: parsed.data.code,
      label: parsed.data.label,
      description: parsed.data.description,
      status: parsed.data.status,
      tags: parsed.data.tags,
      currentSlotId: parsed.data.slotId,
    },
  });
  return { container };
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
  const container = await prisma.container.update({
    where: { id },
    data: {
      code: parsed.data.code,
      label: parsed.data.label,
      description: parsed.data.description,
      status: parsed.data.status,
      tags: parsed.data.tags,
      currentSlotId: parsed.data.slotId,
    },
  });
  return { container };
}

export async function deleteContainer(id: string) {
  await prisma.container.delete({ where: { id } });
  return { success: true };
}
