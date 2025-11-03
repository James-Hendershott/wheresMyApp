// WHY: Server Actions for CRUD on Rack
// WHAT: Create, update, delete Rack using Prisma and Zod

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const rackSchema = z.object({
  name: z.string().min(2, "Name required"),
  locationId: z.string().min(1, "Location required"),
  rows: z.coerce.number().int().min(1),
  cols: z.coerce.number().int().min(1),
});

export async function createRack(formData: FormData) {
  const parsed = rackSchema.safeParse({
    name: formData.get("name"),
    locationId: formData.get("locationId"),
    rows: formData.get("rows"),
    cols: formData.get("cols"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  // Create rack and slots
  const rack = await prisma.rack.create({
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rows: parsed.data.rows,
      cols: parsed.data.cols,
      slots: {
        create: Array.from({ length: parsed.data.rows * parsed.data.cols }, (_, i) => ({
          row: Math.floor(i / parsed.data.cols),
          col: i % parsed.data.cols,
        })),
      },
    },
    include: { slots: true },
  });
  revalidatePath("/racks");
  return { rack };
}

export async function updateRack(id: string, formData: FormData) {
  const parsed = rackSchema.safeParse({
    name: formData.get("name"),
    locationId: formData.get("locationId"),
    rows: formData.get("rows"),
    cols: formData.get("cols"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  // Only update name/location; resizing grid is destructive and not supported here
  const rack = await prisma.rack.update({
    where: { id },
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
    },
  });
  revalidatePath("/racks");
  return { rack };
}

export async function deleteRack(id: string) {
  await prisma.rack.delete({ where: { id } });
  revalidatePath("/racks");
  return { success: true };
}
