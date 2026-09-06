"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import {
  createInvoiceWithItemsSchema,
  updateInvoiceWithItemsSchema,
} from "@/db/validators";
import { invoices, invoiceItems, clients, invoiceStatus } from "@/db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function getInvoices({ page = 1, limit = 10, status, sortBy = "createdAt", sortDir = "desc", q } = {} as { page?: number; limit?: number; status?: string; sortBy?: string; sortDir?: string; q?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: [], total: 0, error: "Unauthorized" };
    }
    const userId = session.user.id;
    const allowedLimits = [10,20,30,50,100];
    const safeLimit = allowedLimits.includes(limit) ? limit : 10;
    const safePage = page > 0 ? page : 1;
    const offset = (safePage - 1) * safeLimit;
    const conditions = [eq(invoices.userId, userId)];
    if (status && status !== "all") conditions.push(eq(invoices.status, status as any));
    if (q && q.trim() !== "") {
      const search = `%${q.trim()}%`;
      conditions.push(sql`(${invoices.number}::text ILIKE ${search} OR ${clients.name} ILIKE ${search})`);
    }
    const where = and(...conditions);

    const orderColumn =
      sortBy === "number" ? invoices.number :
      sortBy === "totalAmount" ? invoices.totalAmount :
      sortBy === "status" ? invoices.status :
      sortBy === "clientName" ? clients.name :
      invoices.createdAt;

    const order = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn);

    const [invoicesList, [{ count }]] = await Promise.all([
      db
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
        .where(where)
        .orderBy(order)
        .limit(safeLimit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(invoices).innerJoin(clients, eq(invoices.clientId, clients.id)).where(where),
    ]);
    return { data: invoicesList, total: Number(count) };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { error: "Failed to fetch invoices" };
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Unauthorized" };
    }
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
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, session.user.id)))
      .limit(1);
    return { data: invoice ?? null };
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    return { error: "Failed to fetch invoice by ID" };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }
    const [deletedInvoice] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, session.user.id)))
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

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const total = data.items.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );

    const invoice = await db.transaction(async (tx) => {
      const [lastInvoice] = await tx
        .select({ number: invoices.number })
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .orderBy(desc(invoices.number))
        .limit(1);
      const nextNumber = (lastInvoice?.number ?? 0) + 1;

      const [newInvoice] = await tx
        .insert(invoices)
        .values({
          number: nextNumber,
          userId,
          clientId: data.clientId,
          status: data.status,
          totalAmount: total,
        })
        .returning();

      await tx.insert(invoiceItems).values(
        data.items.map((item) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
      );

      return newInvoice;
    });

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

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, session.user.id)))
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

    const workingInvoice = await db.transaction(async (tx) => {
      let updatedInvoice = existing;

      if (Object.keys(invoicePatch).length > 0) {
        const [updated] = await tx
          .update(invoices)
          .set(invoicePatch)
          .where(eq(invoices.id, invoiceId))
          .returning();
        updatedInvoice = updated;
      }

      if (data.items !== undefined) {
        await tx
          .delete(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoiceId));

        await tx.insert(invoiceItems).values(
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

        const [finalInvoice] = await tx
          .update(invoices)
          .set({ totalAmount: total })
          .where(eq(invoices.id, invoiceId))
          .returning();
        updatedInvoice = finalInvoice;
      }

      return updatedInvoice;
    });

    revalidatePath("/dashboard/invoices");
    return { data: { invoice: workingInvoice } };
  } catch (error) {
    console.error("Error updating invoice with items:", error);
    return { error: "Failed to update invoice with items" };
  }
}
