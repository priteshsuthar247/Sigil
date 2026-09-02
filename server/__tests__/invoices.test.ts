import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  createInvoiceWithItems,
  updateInvoiceWithItems,
} from "@/server/invoices";

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

function createChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  for (const m of [
    "select",
    "from",
    "where",
    "limit",
    "returning",
    "set",
    "values",
    "innerJoin",
    "orderBy",
    "delete",
    "insert",
    "update",
  ]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(Array.isArray(result) ? result : [result]).then(resolve, reject);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getInvoices", () => {
  it("returns list of invoices with client names", async () => {
    const invoicesList = [
      { id: "1", number: 1001, clientName: "Acme", status: "paid" },
    ];
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(createChain(invoicesList));

    const result = await getInvoices();
    expect(result).toEqual({ data: invoicesList });
  });

  it("returns error on DB failure", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB error");
    });

    const result = await getInvoices();
    expect(result).toEqual({ error: "Failed to fetch invoices" });
  });
});

describe("getInvoiceById", () => {
  it("returns invoice when found", async () => {
    const invoice = { id: "1", number: 1001, clientName: "Acme" };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(createChain([invoice]));

    const result = await getInvoiceById("1");
    expect(result).toEqual({ data: invoice });
  });

  it("returns null when not found", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(createChain([]));

    const result = await getInvoiceById("nonexistent");
    expect(result).toEqual({ data: null });
  });
});

describe("deleteInvoice", () => {
  it("deletes an invoice and revalidates", async () => {
    const deleted = { id: "1", number: 1001 };
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(createChain([deleted]));

    const result = await deleteInvoice("1");
    expect(result).toEqual({ data: deleted });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
  });

  it("returns null when invoice not found", async () => {
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(createChain([]));

    const result = await deleteInvoice("nonexistent");
    expect(result).toEqual({ data: null });
  });
});

describe("createInvoiceWithItems", () => {
  it("creates invoice with computed total", async () => {
    // Mock sequential calls: userId lookup, last invoice number, insert invoice, insert items
    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{ id: "user-1" }]))       // userId lookup
      .mockReturnValueOnce(createChain([{ number: 0 }]));          // last invoice number
    (db.insert as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{ id: "inv-1", number: 1, totalAmount: 2000 }])) // insert invoice
      .mockReturnValueOnce(createChain([undefined]));               // insert items

    const result = await createInvoiceWithItems({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      items: [
        { description: "Item 1", quantity: 2, price: 500 },
        { description: "Item 2", quantity: 1, price: 1000 },
      ],
    });

    expect(result).toHaveProperty("data");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
  });

  it("returns validation error for missing clientId", async () => {
    const result = await createInvoiceWithItems({
      items: [{ description: "Test", quantity: 1, price: 100 }],
    });
    expect(result).toHaveProperty("error");
  });

  it("returns validation error for empty items", async () => {
    const result = await createInvoiceWithItems({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      items: [],
    });
    expect(result).toHaveProperty("error");
  });

  it("auto-increments invoice number", async () => {
    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{ id: "user-1" }]))
      .mockReturnValueOnce(createChain([{ number: 1005 }]));
    (db.insert as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{ id: "inv-1", number: 1006 }]))
      .mockReturnValueOnce(createChain([undefined]));

    const result = await createInvoiceWithItems({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      items: [{ description: "Test", quantity: 1, price: 100 }],
    });

    expect(result).toHaveProperty("data");
  });
});

describe("updateInvoiceWithItems", () => {
  it("blocks edits to paid invoices", async () => {
    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{ id: "inv-1", status: "paid" }]));

    const result = await updateInvoiceWithItems("inv-1", {
      status: "sent",
    });

    expect(result).toEqual({
      error: "Cannot edit a paid invoice",
    });
  });

  it("returns error for nonexistent invoice", async () => {
    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([]));

    const result = await updateInvoiceWithItems("nonexistent", {
      status: "sent",
    });

    expect(result).toEqual({
      error: "Invoice nonexistent not found",
    });
  });

  it("sets paidAt when status changes to paid", async () => {
    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{
        id: "inv-1",
        status: "sent",
        clientId: "c1",
        totalAmount: 1000,
      }]));
    (db.update as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(createChain([{
        id: "inv-1",
        status: "paid",
        clientId: "c1",
        totalAmount: 1000,
        paidAt: new Date(),
      }]));

    const result = await updateInvoiceWithItems("inv-1", {
      status: "paid",
    });

    expect(result).toHaveProperty("data");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
  });
});
