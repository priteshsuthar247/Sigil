import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "@/server/clients";

vi.mock("@/db/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";

function chain(result: unknown) {
  const resolved = Array.isArray(result) ? result : [result];
  const terminal = Promise.resolve(resolved);

  const obj: Record<string, unknown> = {};
  // Make the object itself thenable so `await db.select().from(...)` works
  obj.then = terminal.then.bind(terminal);
  obj.catch = terminal.catch.bind(terminal);
  obj.finally = terminal.finally.bind(terminal);

  // Each method returns the same thenable object (so any chain depth works)
  for (const method of [
    "from",
    "where",
    "limit",
    "returning",
    "set",
    "values",
    "innerJoin",
    "orderBy",
  ]) {
    obj[method] = vi.fn().mockReturnValue(obj);
  }

  return obj;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getClients", () => {
  it("returns list of clients", async () => {
    const clients = [{ id: "1", name: "Acme" }];
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain(clients));

    const result = await getClients();
    expect(result).toEqual({ data: clients });
  });

  it("returns error on DB failure", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB error");
    });

    const result = await getClients();
    expect(result).toEqual({ error: "Failed to fetch clients" });
  });
});

describe("getClientById", () => {
  it("returns client when found", async () => {
    const client = { id: "1", name: "Acme" };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(
      chain([client]),
    );

    const result = await getClientById("1");
    expect(result).toEqual({ data: client });
  });

  it("returns null when not found", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain([]));

    const result = await getClientById("nonexistent");
    expect(result).toEqual({ data: null });
  });
});

describe("createClient", () => {
  it("creates a valid client", async () => {
    const newClient = { id: "1", name: "Acme", email: "a@b.com" };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain(newClient));

    const result = await createClient({
      name: "Acme",
      email: "a@b.com",
    });
    expect(result).toEqual({ data: newClient });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/clients");
  });

  it("returns validation error for invalid input", async () => {
    const result = await createClient({ name: "" });
    expect(result).toHaveProperty("error");
  });
});

describe("updateClient", () => {
  it("updates a client", async () => {
    const updated = { id: "1", name: "New Name" };
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain(updated));

    const result = await updateClient("1", { name: "New Name" });
    expect(result).toEqual({ data: updated });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/clients");
  });

  it("returns validation error for invalid input", async () => {
    const result = await updateClient("1", { email: "bad" });
    expect(result).toHaveProperty("error");
  });

  it("returns null when client not found", async () => {
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain([]));

    const result = await updateClient("nonexistent", { name: "Test" });
    expect(result).toEqual({ data: null });
  });
});

describe("deleteClient", () => {
  it("deletes a client", async () => {
    const deleted = { id: "1", name: "Acme" };
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(chain(deleted));

    const result = await deleteClient("1");
    expect(result).toEqual({ data: deleted });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/clients");
  });

  it("returns null when client not found", async () => {
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(chain([]));

    const result = await deleteClient("nonexistent");
    expect(result).toEqual({ data: null });
  });
});
