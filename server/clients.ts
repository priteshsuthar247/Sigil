"use server";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";
import { createClientSchema, clientUpdateSchema } from "@/db/validators";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getClients() {
  try {
    const clientsList = await db.select().from(clients);
    return clientsList;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
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

export async function createClient(client: unknown) {
  const data = createClientSchema.parse(client);
  try {
    const newClient = await db.insert(clients).values(data).returning();
    revalidatePath("/clients");
    return newClient[0];
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to create client");
  }
}

export async function updateClient(clientId: string, client: unknown) {
  const data = clientUpdateSchema.parse(client);
  try {
    const updatedClient = await db
      .update(clients)
      .set(data)
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
