"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import {
  createInvoiceWithItemsSchema,
  updateInvoiceWithItemsSchema,
} from "@/db/validators";
import { invoices, invoiceItems, clients, invoiceStatus, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getInvoices() {
  try {
    const invoicesList = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        clientId: invoices.clientId,
        clientName: clients.name,
        status: invoices.status,
        totalAmount: invoices.totalAmount,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id));
    return { data: invoicesList };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { error: "Failed to fetch invoices" };
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const [invoice] = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        clientId: invoices.clientId,
        clientName: clients.name,
        status: invoices.status,
        totalAmount: invoices.totalAmount,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    return { data: invoice ?? null };
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    return { error: "Failed to fetch invoice by ID" };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const [deletedInvoice] = await db
      .delete(invoices)
      .where(eq(invoices.id, invoiceId))
      .returning();
    revalidatePath("/dashboard/invoices");
    return { data: deletedInvoice ?? null };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { error: "Failed to delete invoice" };
  }
}

export async function createInvoiceWithItems(input: unknown) {
  const result = createInvoiceWithItemsSchema.safeParse(input);
  if (!result.success) return { error: result.error.flatten() };
  const data = result.data;

  let userId = data.userId;
  if (!userId) {
    const [firstUser] = await db.select({ id: users.id }).from(users).limit(1);
    userId = firstUser?.id;
  }
  if (!userId) return { error: "No user found. Please create a user first." };

  try {
    const total = data.items.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );

    const [lastInvoice] = await db
      .select({ number: invoices.number })
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.number))
      .limit(1);
    const nextNumber = (lastInvoice?.number ?? 0) + 1;

    const [invoice] = await db
      .insert(invoices)
      .values({
        number: nextNumber,
        userId,
        clientId: data.clientId,
        status: data.status,
        totalAmount: total,
      })
      .returning();

    await db.insert(invoiceItems).values(
      data.items.map((item) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    revalidatePath("/dashboard/invoices");
    return { data: { invoice } };
  } catch (error) {
    console.error("Error creating invoice with items:", error);
    return { error: "Failed to create invoice with items" };
  }
}

export async function updateInvoiceWithItems(
  invoiceId: string,
  input: unknown,
) {
  const result = updateInvoiceWithItemsSchema.safeParse(input);
  if (!result.success) return { error: result.error.flatten() };
  const data = result.data;

  try {
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existing) return { error: `Invoice ${invoiceId} not found` };
    if (existing.status === "paid") {
      return { error: "Cannot edit a paid invoice" };
    }

    const invoicePatch: {
      clientId?: string;
      status?: (typeof invoiceStatus.enumValues)[number];
      paidAt?: Date | null;
    } = {};
    if (data.clientId !== undefined) invoicePatch.clientId = data.clientId;
    if (data.status !== undefined) {
      invoicePatch.status = data.status;
      invoicePatch.paidAt = data.status === "paid" ? new Date() : null;
    }

    let workingInvoice = existing;
    if (Object.keys(invoicePatch).length > 0) {
      const [updated] = await db
        .update(invoices)
        .set(invoicePatch)
        .where(eq(invoices.id, invoiceId))
        .returning();
      workingInvoice = updated;
    }

    if (data.items !== undefined) {
      await db
        .delete(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoiceId));

      await db.insert(invoiceItems).values(
        data.items.map((item) => ({
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
      );

      const total = data.items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0,
      );

      const [finalInvoice] = await db
        .update(invoices)
        .set({ totalAmount: total })
        .where(eq(invoices.id, invoiceId))
        .returning();
      workingInvoice = finalInvoice;
    }

    revalidatePath("/dashboard/invoices");
    return { data: { invoice: workingInvoice } };
  } catch (error) {
    console.error("Error updating invoice with items:", error);
    return { error: "Failed to update invoice with items" };
  }
}
