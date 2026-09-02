"use server";
import { db } from "@/db/drizzle";
import { invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getInvoiceItemsByInvoiceId(invoiceId: string) {
  try {
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
    return { data: items };
  } catch (error) {
    console.error("Error fetching invoice items by invoice ID:", error);
    return { error: "Failed to fetch invoice items by invoice ID" };
  }
}
