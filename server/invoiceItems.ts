"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import {
  createInvoiceItemSchema,
  invoiceItemUpdateSchema,
} from "@/db/validators";
import { invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getInvoiceItems() {
  try {
    const invoiceItemsList = await db.select().from(invoiceItems);
    return invoiceItemsList;
  } catch (error) {
    console.error("Error fetching invoice items:", error);
    throw new Error("Failed to fetch invoice items");
  }
}

export async function getInvoiceItemById(invoiceItemId: string) {
  try {
    const invoiceItem = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.id, invoiceItemId));
    return invoiceItem;
  } catch (error) {
    console.error("Error fetching invoice item by ID:", error);
    throw new Error("Failed to fetch invoice item by ID");
  }
}

export async function createInvoiceItem(invoiceItem: unknown) {
  const data = createInvoiceItemSchema.parse(invoiceItem);
  try {
    const newInvoiceItem = await db
      .insert(invoiceItems)
      .values(data)
      .returning();
    revalidatePath("/invoices");
    return newInvoiceItem[0];
  } catch (error) {
    console.error("Error creating invoice item:", error);
    throw new Error("Failed to create invoice item");
  }
}

export async function updateInvoiceItem(
  invoiceItemId: string,
  invoiceItem: unknown,
) {
  const data = invoiceItemUpdateSchema.parse(invoiceItem);
  try {
    const updatedInvoiceItem = await db
      .update(invoiceItems)
      .set(data)
      .where(eq(invoiceItems.id, invoiceItemId))
      .returning();
    revalidatePath("/invoices");
    return updatedInvoiceItem[0];
  } catch (error) {
    console.error("Error updating invoice item:", error);
    throw new Error("Failed to update invoice item");
  }
}

export async function deleteInvoiceItem(invoiceItemId: string) {
  try {
    const deletedInvoiceItem = await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.id, invoiceItemId))
      .returning();
    revalidatePath("/invoices");
    return deletedInvoiceItem[0];
  } catch (error) {
    console.error("Error deleting invoice item:", error);
    throw new Error("Failed to delete invoice item");
  }
}
