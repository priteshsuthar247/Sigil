"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { Client, NewClient, clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getClients() {
  const clientsList = await db.select().from(clients);
  return clientsList;
}

export async function getClientById(clientId: string) {
  try {
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId));
    return client;
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    throw new Error("Failed to fetch client by ID");
  }
}

export async function createClient(client: NewClient) {
  try {
    const newClient = await db.insert(clients).values(client).returning();
    revalidatePath("/clients");
    return newClient[0];
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to create client");
  }
}

export async function updateClient(
  clientId: string,
  client: Partial<NewClient>,
) {
  try {
    const updatedClient = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, clientId))
      .returning();
    revalidatePath("/clients");
    return updatedClient[0];
  } catch (error) {
    console.error("Error updating client:", error);
    throw new Error("Failed to update client");
  }
}

export async function deleteClient(clientId: string) {
  try {
    const deletedClient = await db
      .delete(clients)
      .where(eq(clients.id, clientId))
      .returning();
    revalidatePath("/clients");
    return deletedClient[0];
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Failed to delete client");
  }
}
