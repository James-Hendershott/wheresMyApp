// WHY: Server Actions for CRUD on Location
// WHAT: Create, update, delete Location using Prisma and Zod

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
    return { error: "Validation failed: " + parsed.error.errors[0].message };
  }

  // Check for duplicate location name
  const existing = await prisma.location.findFirst({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "Location already exists with this name. Try again." };
  }

  const loc = await prisma.location.create({ data: parsed.data });
  revalidatePath("/racks");
  return { success: `Location "${loc.name}" created successfully!` };
}

export async function updateLocation(id: string, formData: FormData) {
  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const loc = await prisma.location.update({
    where: { id },
    data: parsed.data,
  });
  revalidatePath("/racks");
  return { location: loc };
}

export async function deleteLocation(id: string) {
  await prisma.location.delete({ where: { id } });
  revalidatePath("/racks");
  return { success: true };
}
