"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import {
  createInvoiceSchema,
  invoiceUpdateSchema,
  createInvoiceWithItemsSchema,
  updateInvoiceWithItemsSchema,
} from "@/db/validators";
import { invoices, invoiceItems, invoiceStatus } from "@/db/schema";
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

export async function createInvoice(invoice: unknown) {
  const data = createInvoiceSchema.parse(invoice);
  try {
    const newInvoice = await db.insert(invoices).values(data).returning();
    revalidatePath("/invoices");
    return newInvoice[0];
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
}

export async function updateInvoice(invoiceId: string, invoice: unknown) {
  const data = invoiceUpdateSchema.parse(invoice);
  try {
    const updatedInvoice = await db
      .update(invoices)
      .set(data)
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

export async function createInvoiceWithItems(input: unknown) {
  const data = createInvoiceWithItemsSchema.parse(input);

  try {
    return await db.transaction(async (tx) => {
      // 1. Insert invoice shell with totalAmount = 0 placeholder
      const [invoice] = await tx
        .insert(invoices)
        .values({
          userId: data.userId,
          clientId: data.clientId,
          status: data.status,
          totalAmount: 0,
        })
        .returning();

      // 2. Insert all items
      const items = data.items.map((item) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }));
      await tx.insert(invoiceItems).values(items);

      // 3. Compute and persist total
      const total = data.items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0,
      );
      const [updated] = await tx
        .update(invoices)
        .set({ totalAmount: total })
        .where(eq(invoices.id, invoice.id))
        .returning();

      revalidatePath("/invoices");
      return { invoice: updated };
    });
  } catch (error) {
    console.error("Error creating invoice with items:", error);
    throw new Error("Failed to create invoice with items");
  }
}

export async function updateInvoiceWithItems(
  invoiceId: string,
  input: unknown,
) {
  const data = updateInvoiceWithItemsSchema.parse(input);

  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);
      if (!existing) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      const invoicePatch: {
        clientId?: string;
        status?: (typeof invoiceStatus.enumValues)[number];
      } = {};
      if (data.clientId !== undefined) invoicePatch.clientId = data.clientId;
      if (data.status !== undefined) invoicePatch.status = data.status;

      let workingInvoice = existing;
      if (Object.keys(invoicePatch).length > 0) {
        const [updated] = await tx
          .update(invoices)
          .set(invoicePatch)
          .where(eq(invoices.id, invoiceId))
          .returning();
        workingInvoice = updated;
      }

      if (data.items !== undefined) {
        await tx
          .delete(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoiceId));

        const newItems = data.items.map((item) => ({
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }));

        await tx.insert(invoiceItems).values(newItems);

        const total = data.items.reduce(
          (sum, i) => sum + i.quantity * i.price,
          0,
        );

        const [finalInvoice] = await tx
          .update(invoices)
          .set({ totalAmount: total })
          .where(eq(invoices.id, invoiceId))
          .returning();
        workingInvoice = finalInvoice;
      }

      revalidatePath("/invoices");
      return { invoice: workingInvoice };
    });
  } catch (error) {
    console.error("Error updating invoice with items:", error);
    throw new Error("Failed to update invoice with items");
  }
}
