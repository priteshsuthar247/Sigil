"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import { createClientSchema, clientUpdateSchema } from "@/db/validators";
import { clients } from "@/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";

export async function getClients({ page = 1, limit = 10, sortBy = "name", sortDir = "asc" } = {}) {
  try {
    const offset = (page - 1) * limit;
    const orderColumn = sortBy === "email" ? clients.email : sortBy === "createdAt" ? clients.createdAt : clients.name;
    const order = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn);

    const [clientsList, [{ count }]] = await Promise.all([
      db.select().from(clients).orderBy(order).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(clients),
    ]);
    return { data: clientsList, total: Number(count) };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { error: "Failed to fetch clients" };
  }
}

export async function getClientById(clientId: string) {
  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);
    return { data: client ?? null };
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    return { error: "Failed to fetch client by ID" };
  }
}

export async function createClient(client: unknown) {
  const result = createClientSchema.safeParse(client);
  if (!result.success) return { error: result.error.flatten() };
  try {
    const [newClient] = await db
      .insert(clients)
      .values(result.data)
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: newClient };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client" };
  }
}

export async function updateClient(clientId: string, client: unknown) {
  const result = clientUpdateSchema.safeParse(client);
  if (!result.success) return { error: result.error.flatten() };
  try {
    const [updatedClient] = await db
      .update(clients)
      .set(result.data)
      .where(eq(clients.id, clientId))
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: updatedClient ?? null };
  } catch (error) {
    console.error("Error updating client:", error);
    return { error: "Failed to update client" };
  }
}

export async function deleteClient(clientId: string) {
  try {
    const [deletedClient] = await db
      .delete(clients)
      .where(eq(clients.id, clientId))
      .returning();
    revalidatePath("/dashboard/clients");
    return { data: deletedClient ?? null };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { error: "Failed to delete client" };
  }
}
