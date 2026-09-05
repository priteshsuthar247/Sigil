'use server';

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { upsertCompanyProfile } from "@/server/company";

export async function upsertCompanyProfileAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await upsertCompanyProfile(session.user.id, data, data.currentPassword);
  revalidatePath("/dashboard/settings/business-profile");
}
