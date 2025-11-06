// WHY: Server Actions for CRUD on Item
// WHAT: Create, update, delete Item using Prisma and Zod

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ItemStatus } from "@prisma/client";
import { auth } from "@/auth";

const itemSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.IN_STORAGE),
  containerId: z.string().optional(),
  tags: z.string().array().optional(),
  isContainer: z.boolean().default(false),
  volume: z.number().positive().optional(),
  currentSlotId: z.string().optional(),
}).refine(
  (data) => {
    // If item is a container, it can have currentSlotId but not containerId
    // If item is NOT a container, it needs containerId (unless being created standalone)
    if (data.isContainer && data.containerId) {
      return false; // Container items can't be inside other containers
    }
    return true;
  },
  {
    message: "Items acting as containers cannot be placed inside other containers",
  }
);

// ───────────────────── Check Out Item ─────────────────────

export async function checkOutItem(itemId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { container: true },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    if (item.status === "CHECKED_OUT") {
      return { success: false, error: "Item is already checked out" };
    }

    // Update item status and log movement in transaction
    await prisma.$transaction([
      prisma.item.update({
        where: { id: itemId },
        data: { status: "CHECKED_OUT" },
      }),
      prisma.movement.create({
        data: {
          actorId: session.user.id,
          itemId: itemId,
          action: "check_out",
          fromContainerId: item.containerId,
        },
      }),
    ]);

    revalidatePath(`/containers/${item.containerId}`);
    revalidatePath("/containers");

    return { success: true };
  } catch (error) {
    console.error("Check out error:", error);
    return { success: false, error: "Failed to check out item" };
  }
}

// ───────────────────── Check In Item ─────────────────────

export async function checkInItem(itemId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { container: true },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    if (item.status !== "CHECKED_OUT") {
      return { success: false, error: "Item is not checked out" };
    }

    // Update item status and log movement in transaction
    await prisma.$transaction([
      prisma.item.update({
        where: { id: itemId },
        data: { status: "IN_STORAGE" },
      }),
      prisma.movement.create({
        data: {
          actorId: session.user.id,
          itemId: itemId,
          action: "check_in",
          toContainerId: item.containerId,
        },
      }),
    ]);

    revalidatePath(`/containers/${item.containerId}`);
    revalidatePath("/containers");

    return { success: true };
  } catch (error) {
    console.error("Check in error:", error);
    return { success: false, error: "Failed to check in item" };
  }
}

// ───────────────────── Move Item to Different Container ─────────────────────

const MoveItemSchema = z.object({
  itemId: z.string().min(1),
  targetContainerId: z.string().min(1),
});

export async function moveItemToContainer(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const data = MoveItemSchema.parse({
      itemId: formData.get("itemId"),
      targetContainerId: formData.get("targetContainerId"),
    });

    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const fromContainerId = item.containerId;

    // Move item and log movement in transaction
    await prisma.$transaction([
      prisma.item.update({
        where: { id: data.itemId },
        data: { containerId: data.targetContainerId },
      }),
      prisma.movement.create({
        data: {
          actorId: session.user.id,
          itemId: data.itemId,
          action: "move",
          fromContainerId: fromContainerId,
          toContainerId: data.targetContainerId,
        },
      }),
    ]);

    if (fromContainerId) {
      revalidatePath(`/containers/${fromContainerId}`);
    }
    revalidatePath(`/containers/${data.targetContainerId}`);
    revalidatePath("/containers");

    return { success: true };
  } catch (error) {
    console.error("Move item error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data" };
    }
    return { success: false, error: "Failed to move item" };
  }
}

// ───────────────────── Remove Item Permanently ─────────────────────

export async function removeItemPermanently(itemId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const containerId = item.containerId;

    // Log removal before deleting
    await prisma.movement.create({
      data: {
        actorId: session.user.id,
        itemId: itemId,
        action: "remove",
        fromContainerId: containerId,
        note: `Removed item: ${item.name}`,
      },
    });

    // Delete item (cascades to photos via schema)
    await prisma.item.delete({
      where: { id: itemId },
    });

    if (containerId) {
      revalidatePath(`/containers/${containerId}`);
    }
    revalidatePath("/containers");

    return { success: true };
  } catch (error) {
    console.error("Remove item error:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

// ───────────────────── Edit Item Details ─────────────────────

const EditItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  condition: z
    .enum(["UNOPENED", "OPENED_COMPLETE", "OPENED_MISSING", "USED", "DAMAGED"])
    .optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
});

export async function editItemDetails(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const data = EditItemSchema.parse({
      itemId: formData.get("itemId"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      quantity: formData.get("quantity"),
      condition: formData.get("condition") || undefined,
      category: formData.get("category") || undefined,
      subcategory: formData.get("subcategory") || undefined,
    });

    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    await prisma.item.update({
      where: { id: data.itemId },
      data: {
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        condition: data.condition,
        category: data.category as any,
        subcategory: data.subcategory as any,
      },
    });

    if (item.containerId) {
      revalidatePath(`/containers/${item.containerId}`);
    }
    revalidatePath("/containers");

    return { success: true };
  } catch (error) {
    console.error("Edit item error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to edit item" };
  }
}

export async function createItem(formData: FormData) {
  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || ItemStatus.IN_STORAGE,
    containerId: formData.get("containerId") || undefined,
    tags: formData.getAll("tags") as string[],
    isContainer: formData.get("isContainer") === "true",
    volume: formData.get("volume") ? parseFloat(formData.get("volume") as string) : undefined,
    currentSlotId: formData.get("currentSlotId") || undefined,
  });
  if (!parsed.success) {
    return { error: "Validation failed: " + parsed.error.errors[0].message };
  }

  // Check if item already exists (items CAN be duplicates, but we warn the user)
  const existing = await prisma.item.findFirst({
    where: {
      name: parsed.data.name,
      containerId: parsed.data.containerId,
    },
  });

  const item = await prisma.item.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      tags: parsed.data.tags,
      containerId: parsed.data.containerId,
      isContainer: parsed.data.isContainer,
      volume: parsed.data.volume,
      currentSlotId: parsed.data.currentSlotId,
    },
  });
  revalidatePath("/racks");

  if (existing) {
    return {
      success: `Item "${item.name}" created (Note: Similar item already exists in this container)`,
    };
  }
  return { success: `Item "${item.name}" created successfully!` };
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
  revalidatePath("/racks");
  return { item };
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/racks");
  return { success: true };
}
