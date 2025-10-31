// WHY: Server Actions for CRUD on Item
// WHAT: Create, update, delete Item using Prisma and Zod

"use server";
import { z } from "zod";
import { PrismaClient, ItemStatus } from "@prisma/client";

const prisma = new PrismaClient();

const itemSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.IN_STORAGE),
  containerId: z.string().optional(),
  tags: z.string().array().optional(),
});

export async function createItem(formData: FormData) {
  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || ItemStatus.IN_STORAGE,
    containerId: formData.get("containerId") || undefined,
    tags: formData.getAll("tags") as string[],
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const item = await prisma.item.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      tags: parsed.data.tags,
      containerId: parsed.data.containerId,
    },
  });
  return { item };
}

export async function updateItem(id: string, formData: FormData) {
  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || ItemStatus.IN_STORAGE,
    containerId: formData.get("containerId") || undefined,
    tags: formData.getAll("tags") as string[],
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const item = await prisma.item.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      tags: parsed.data.tags,
      containerId: parsed.data.containerId,
    },
  });
  return { item };
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  return { success: true };
}
