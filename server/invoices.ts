"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { invoices, Invoice, NewInvoice } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getInvoices() {
  try {
    const invoicesList = await db.select().from(invoices);
    return invoicesList;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId));
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw new Error("Failed to fetch invoice by ID");
  }
}

export async function createInvoice(invoice: NewInvoice) {
  try {
    const newInvoice = await db.insert(invoices).values(invoice).returning();
    revalidatePath("/invoices");
    return newInvoice[0];
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
}

export async function updateInvoice(
  invoiceId: string,
  invoice: Partial<NewInvoice>,
) {
  try {
    const updatedInvoice = await db
      .update(invoices)
      .set(invoice)
      .where(eq(invoices.id, invoiceId))
      .returning();
    revalidatePath("/invoices");
    return updatedInvoice[0];
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw new Error("Failed to update invoice");
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const deletedInvoice = await db
      .delete(invoices)
      .where(eq(invoices.id, invoiceId))
      .returning();
    revalidatePath("/invoices");
    return deletedInvoice[0];
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new Error("Failed to delete invoice");
  }
}
