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
    return { error: "Validation failed: " + parsed.error.errors[0].message };
  }

  // Check for duplicate rack name
  const existing = await prisma.rack.findFirst({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "Rack already exists with this name. Try again." };
  }

  // Create rack and slots
  const rack = await prisma.rack.create({
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rows: parsed.data.rows,
      cols: parsed.data.cols,
      slots: {
        create: Array.from(
          { length: parsed.data.rows * parsed.data.cols },
          (_, i) => ({
            row: Math.floor(i / parsed.data.cols),
            col: i % parsed.data.cols,
          })
        ),
      },
    },
    include: { slots: true },
  });
  revalidatePath("/racks");
  return {
    success: `Rack "${rack.name}" created with ${rack.slots.length} slots!`,
  };
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

export async function updateRackWithData(
  id: string,
  data: {
    name: string;
    rows: number;
    cols: number;
    locationId: string;
  }
) {
  const parsed = rackSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Fetch existing rack and slots
  const existingRack = await prisma.rack.findUnique({
    where: { id },
    include: { slots: { include: { container: true } } },
  });

  if (!existingRack) {
    return { error: "Rack not found" };
  }

  // Update rack details
  const rack = await prisma.rack.update({
    where: { id },
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rows: parsed.data.rows,
      cols: parsed.data.cols,
    },
  });

  // Handle slot grid changes if dimensions changed
  if (
    parsed.data.rows !== existingRack.rows ||
    parsed.data.cols !== existingRack.cols
  ) {
    // Delete all existing slots
    await prisma.slot.deleteMany({ where: { rackId: id } });

    // Create new slot grid
    await prisma.slot.createMany({
      data: Array.from(
        { length: parsed.data.rows * parsed.data.cols },
        (_, i) => ({
          rackId: id,
          row: Math.floor(i / parsed.data.cols),
          col: i % parsed.data.cols,
        })
      ),
    });

    // Reassign containers to new slots if their positions still exist
    const containersToReassign = existingRack.slots.filter((s) => s.container);
    for (const slot of containersToReassign) {
      if (
        slot.row < parsed.data.rows &&
        slot.col < parsed.data.cols &&
        slot.container
      ) {
        // Find the new slot at this position
        const newSlot = await prisma.slot.findFirst({
          where: {
            rackId: id,
            row: slot.row,
            col: slot.col,
          },
        });
        if (newSlot) {
          await prisma.container.update({
            where: { id: slot.container.id },
            data: { currentSlotId: newSlot.id },
          });
        } else {
          // Position no longer exists, unassign container
          await prisma.container.update({
            where: { id: slot.container.id },
            data: { currentSlotId: null },
          });
        }
      }
    }
  }

  revalidatePath("/racks");
  revalidatePath("/locations");
  return { success: true, rack };
}

export async function deleteRack(id: string) {
  await prisma.rack.delete({ where: { id } });
  revalidatePath("/racks");
  return { success: true };
}
