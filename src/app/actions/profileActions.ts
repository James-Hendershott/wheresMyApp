// WHY: Server actions for account management
// WHAT: Update user name, avatar URL

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(1, "Name required"),
  image: z.string().url("Must be valid URL").optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Unauthenticated" };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    image: (formData.get("image") as string) || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: parsed.data.name,
        image: parsed.data.image || null,
      },
    });
    revalidatePath("/account");
    return { success: "Profile updated" };
  } catch (e) {
    return { error: String((e as Error)?.message) || "Update failed" };
  }
}
