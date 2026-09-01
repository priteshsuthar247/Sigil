"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { invoiceItems, InvoiceItem, NewInvoiceItem } from "@/db/schema";
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

export async function createInvoiceItem(invoiceItem: NewInvoiceItem) {
  try {
    const newInvoiceItem = await db
      .insert(invoiceItems)
      .values(invoiceItem)
      .returning();
    revalidatePath("/invoice-items");
    return newInvoiceItem[0];
  } catch (error) {
    console.error("Error creating invoice item:", error);
    throw new Error("Failed to create invoice item");
  }
}

export async function updateInvoiceItem(
  invoiceItemId: string,
  invoiceItem: Partial<NewInvoiceItem>,
) {
  try {
    const updatedInvoiceItem = await db
      .update(invoiceItems)
      .set(invoiceItem)
      .where(eq(invoiceItems.id, invoiceItemId))
      .returning();
    revalidatePath("/invoice-items");
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
    revalidatePath("/invoice-items");
    return deletedInvoiceItem[0];
  } catch (error) {
    console.error("Error deleting invoice item:", error);
    throw new Error("Failed to delete invoice item");
  }
}
