// WHY: Server Actions for CRUD on Location
// WHAT: Create, update, delete Location using Prisma and Zod

"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const locationSchema = z.object({
  name: z.string().min(2, "Name required"),
  notes: z.string().optional(),
});

export async function createLocation(formData: FormData) {
  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const loc = await prisma.location.create({ data: parsed.data });
  return { location: loc };
}

export async function updateLocation(id: string, formData: FormData) {
  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const loc = await prisma.location.update({ where: { id }, data: parsed.data });
  return { location: loc };
}

export async function deleteLocation(id: string) {
  await prisma.location.delete({ where: { id } });
  return { success: true };
}
