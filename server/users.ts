"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  currentPassword: z.string().optional(),
  password: z.string()
    .optional()
    .or(z.literal(""))
    .refine(val => !val || passwordRegex.test(val), {
      message: "Password must be at least 8 characters with uppercase, lowercase and number",
    }),
}).refine(data => {
  if (data.password && data.password !== "") {
    return !!data.currentPassword && data.currentPassword.length > 0;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

export async function getCurrentUser(): Promise<ActionResult<{ id: string; name: string; email: string; createdAt: Date }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!user) return { error: "User not found" };
  return { data: user };
}

import type { ActionResult } from "@/lib/schemas";

export type UpdateUserResult = ActionResult<{ id: string; name: string; email: string }>;

export async function updateCurrentUser(data: unknown): Promise<UpdateUserResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const { name, password, currentPassword } = parsed.data;
  
  // Fetch current user password hash
  const [currentUser] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  
  if (!currentUser) {
    return { error: "User not found" };
  }

  if (password && password !== "") {
    const isValid = await bcrypt.compare(currentPassword || "", currentUser.password);
    if (!isValid) {
      return { error: { formErrors: ["Current password is incorrect"] } };
    }
    // Hash new password
    const updates: any = { name, password: await bcrypt.hash(password, 10) };
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))
      .returning({ id: users.id, name: users.name, email: users.email });
    revalidatePath("/dashboard/account");
    // Force re-authentication after password change by redirecting to sign out
    redirect("/api/auth/signout?callbackUrl=/login");
    return { data: updated };
  }

  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id, name: users.name, email: users.email });
  revalidatePath("/dashboard/account");
  return { data: updated };
}
