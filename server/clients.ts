"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import { createClientSchema, clientUpdateSchema } from "@/db/validators";
import { clients } from "@/db/schema";
import { eq, asc, desc, sql, and, or, ilike } from "drizzle-orm";
import { auth } from "@/auth";

export async function getClients({ page = 1, limit = 10, sortBy = "name", sortDir = "asc", q } = {} as { page?: number; limit?: number; sortBy?: string; sortDir?: string; q?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: [], total: 0, error: "Unauthorized" };
    }
    const allowedLimits = [10,20,30,50,100];
    const safeLimit = allowedLimits.includes(limit) ? limit : 10;
    const safePage = page > 0 ? page : 1;
    const offset = (safePage - 1) * safeLimit;
    const orderColumn = sortBy === "email" ? clients.email : sortBy === "createdAt" ? clients.createdAt : clients.name;
    const order = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn);

    let where = eq(clients.userId, session.user.id) as any;
    if (q && q.trim() !== "") {
      const search = `%${q.trim()}%`;
      where = and(where, or(ilike(clients.name, search), ilike(clients.email, search))) as any;
    }

    const [clientsList, [{ count }]] = await Promise.all([
      db.select().from(clients).where(where).orderBy(order).limit(safeLimit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(clients).where(where),
    ]);
    return { data: clientsList, total: Number(count) };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { error: "Failed to fetch clients" };
  }
}

export async function getClientById(clientId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Unauthorized" };
    }
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.userId, session.user.id)))
      .limit(1);
    return { data: client ?? null };
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    return { error: "Failed to fetch client by ID" };
  }
}

export async function createClient(client: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const result = createClientSchema.safeParse(client);
  if (!result.success) return { error: result.error.flatten() };
  const data = {
    ...result.data,
    email: result.data.email.trim().toLowerCase(),
    userId: session.user.id,
  };
  try {
    const [newClient] = await db
      .insert(clients)
      .values(data)
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: newClient };
  } catch (error) {
    console.error("Error creating client:", error);
    const msg = (error as any)?.message || "";
    if (msg.includes("clients_user_email_unique") || (error as any)?.code === "23505") {
      return { error: "A client with this email already exists for your account." };
    }
    return { error: "Failed to create client" };
  }
}

export async function updateClient(clientId: string, client: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const result = clientUpdateSchema.safeParse(client);
  if (!result.success) return { error: result.error.flatten() };
  const data = { ...result.data };
  if (data.email) data.email = data.email.trim().toLowerCase();
  try {
    const [updatedClient] = await db
      .update(clients)
      .set(data)
      .where(and(eq(clients.id, clientId), eq(clients.userId, session.user.id)))
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: updatedClient ?? null };
  } catch (error) {
    console.error("Error updating client:", error);
    const msg = (error as any)?.message || "";
    if (msg.includes("clients_user_email_unique") || (error as any)?.code === "23505") {
      return { error: "A client with this email already exists for your account." };
    }
    return { error: "Failed to update client" };
  }
}

export async function deleteClient(clientId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  try {
    const [deletedClient] = await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.userId, session.user.id)))
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: deletedClient ?? null };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { error: "Failed to delete client" };
  }
}
