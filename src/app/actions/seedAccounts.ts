// WHY: Seed test accounts for local development
// WHAT: Create admin and regular user accounts (idempotent)

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function seedTestAccounts() {
  // Only allow seeding in development or by admin
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    const currentUser = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;
    if (currentUser?.role !== "ADMIN") {
      return { error: "Admin only" };
    }
  }

  try {
    // Test Admin
    const admin = await prisma.user.upsert({
      where: { email: "admin@test.local" },
      update: { role: "ADMIN" },
      create: {
        name: "Test Admin",
        email: "admin@test.local",
        role: "ADMIN",
      },
    });

    // Test User
    const user = await prisma.user.upsert({
      where: { email: "user@test.local" },
      update: { role: "USER" },
      create: {
        name: "Test User",
        email: "user@test.local",
        role: "USER",
      },
    });

    return {
      success: `Test accounts seeded:\n- Admin: admin@test.local\n- User: user@test.local`,
      accounts: { admin, user },
    };
  } catch (e) {
    return {
      error: String((e as Error)?.message) || "Failed to seed accounts",
    };
  }
}
