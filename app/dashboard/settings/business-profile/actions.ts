'use server';

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { upsertCompanyProfile } from "@/server/company";

import { z } from "zod";

const UpsertCompanyProfileInput = z.object({
  companyName: z.string(),
  companyAddress: z.string(),
  companyEmail: z.string(),
  companyPhone: z.string(),
  paymentTerms: z.string(),
  gstin: z.string(),
  notes: z.string(),
  currentPassword: z.string(),
});
type UpsertCompanyProfileInput = z.infer<typeof UpsertCompanyProfileInput>;

export async function upsertCompanyProfileAction(data: UpsertCompanyProfileInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await upsertCompanyProfile(session.user.id, data, data.currentPassword);
  revalidatePath("/dashboard/settings/business-profile");
}
