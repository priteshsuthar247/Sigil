import { db } from "@/db/drizzle";
import { companyProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CompanyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Address is required"),
  companyEmail: z.string().email("Invalid email"),
  companyPhone: z.string().min(1, "Phone is required"),
  paymentTerms: z.string().min(1, "Payment terms required"),
  gstin: z.string().min(1, "GSTIN required"),
  notes: z.string().min(1, "Notes required"),
});

export async function getCompanyProfile(userId: string) {
  const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function upsertCompanyProfile(userId: string, data: z.infer<typeof CompanyProfileSchema>, currentPassword: string) {
  const parsed = CompanyProfileSchema.parse(data);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const [existing] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId)).limit(1);

  if (existing) {
    await db.update(companyProfiles)
      .set({
        companyName: parsed.companyName,
        companyAddress: parsed.companyAddress,
        companyEmail: parsed.companyEmail,
        companyPhone: parsed.companyPhone,
        paymentTerms: parsed.paymentTerms,
        gstin: parsed.gstin,
        notes: parsed.notes,
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.userId, userId));
  } else {
    await db.insert(companyProfiles).values({
      userId,
      ...parsed,
    });
  }
}
