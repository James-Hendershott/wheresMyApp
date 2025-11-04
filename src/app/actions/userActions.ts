// WHY: Server actions for user management and registration approval
// WHAT: Create registration requests, list pending, approve/reject

"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const registrationSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  reason: z.string().optional(),
});

export async function createRegistrationRequest(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    // Ensure the PendingUser table exists (defensive)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "pending_users" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text UNIQUE NOT NULL,
        "reason" text NULL,
        "status" text NOT NULL DEFAULT 'PENDING',
        "createdAt" timestamp(3) NOT NULL DEFAULT now()
      );
    `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = prisma as any;
    await tx.pendingUser.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        reason: parsed.data.reason,
      },
    });
    return { success: "Request submitted! An admin will review it." };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Email already requested or registered." };
    }
    return { error: e?.message || "Failed to submit request" };
  }
}

export async function listPendingUsers() {
  const session = await auth();
  if (!session?.user) return [];

  // Admin only
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (currentUser?.role !== "ADMIN") return [];

  try {
    const tx = prisma as any;
    const pending = await tx.pendingUser.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });
    return pending as Array<{
      id: string;
      name: string;
      email: string;
      reason?: string | null;
      createdAt: Date;
    }>;
  } catch {
    // If table doesn't exist yet, return empty
    return [];
  }
}

export async function approvePendingUser(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthenticated" };

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (currentUser?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  try {
    const tx = prisma as any;
    const pending = await tx.pendingUser.findUnique({ where: { id } });
    if (!pending) return { error: "Request not found" };
    if (pending.status !== "PENDING") {
      return { error: "Already processed" };
    }

    // Create user account
    await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        role: "USER",
      },
    });

    // Mark as approved
    await tx.pendingUser.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    revalidatePath("/admin/pending-users");
    return { success: `User ${pending.email} approved and created.` };
  } catch (e: any) {
    return { error: e?.message || "Failed to approve user" };
  }
}

export async function rejectPendingUser(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthenticated" };

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (currentUser?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  try {
    const tx = prisma as any;
    await tx.pendingUser.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    revalidatePath("/admin/pending-users");
    return { success: "Request rejected." };
  } catch (e: any) {
    return { error: e?.message || "Failed to reject user" };
  }
}
