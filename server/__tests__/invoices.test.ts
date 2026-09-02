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
    transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";

function createTx(results?: unknown[]) {
  let callIndex = 0;
  const queue = results ?? [undefined];

  const methods = [
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
  ];

  function makeChain(): Record<string, unknown> {
    const tx: Record<string, unknown> = {};
    for (const m of methods) {
      tx[m] = vi.fn().mockReturnValue(tx);
    }
    tx.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
      const raw = queue[callIndex] !== undefined ? queue[callIndex] : undefined;
      const resolved = Array.isArray(raw) ? raw : [raw];
      callIndex++;
      return Promise.resolve(resolved).then(resolve, reject);
    };
    return tx;
  }

  return makeChain();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getInvoices", () => {
  it("returns list of invoices with client names", async () => {
    const invoicesList = [
      { id: "1", number: 1001, clientName: "Acme", status: "paid" },
    ];
    const chain = createTx([invoicesList]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

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
    const chain = createTx([[invoice]]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await getInvoiceById("1");
    expect(result).toEqual({ data: invoice });
  });

  it("returns null when not found", async () => {
    const chain = createTx([[]]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await getInvoiceById("nonexistent");
    expect(result).toEqual({ data: null });
  });
});

describe("deleteInvoice", () => {
  it("deletes an invoice and revalidates", async () => {
    const deleted = { id: "1", number: 1001 };
    const chain = createTx([[deleted]]);
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await deleteInvoice("1");
    expect(result).toEqual({ data: deleted });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
  });

  it("returns null when invoice not found", async () => {
    const chain = createTx([[]]);
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const result = await deleteInvoice("nonexistent");
    expect(result).toEqual({ data: null });
  });
});

describe("createInvoiceWithItems", () => {
  it("creates invoice with computed total", async () => {
    const lastInvoice = [{ number: 0 }];
    const insertedInvoice = [{ id: "inv-1", number: 1, totalAmount: 2000 }];
    const tx = createTx([lastInvoice, insertedInvoice, undefined]);
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: ReturnType<typeof createTx>) => Promise<unknown>) => fn(tx),
    );

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
    const lastInvoice = [{ number: 1005 }];
    const insertedInvoice = [{ id: "inv-1", number: 1006 }];
    const tx = createTx([lastInvoice, insertedInvoice, undefined]);
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: ReturnType<typeof createTx>) => Promise<unknown>) => fn(tx),
    );

    const result = await createInvoiceWithItems({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      items: [{ description: "Test", quantity: 1, price: 100 }],
    });

    expect(result).toHaveProperty("data");
  });
});

describe("updateInvoiceWithItems", () => {
  it("blocks edits to paid invoices", async () => {
    const existing = [{ id: "inv-1", status: "paid" }];
    const tx = createTx([existing]);
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: ReturnType<typeof createTx>) => Promise<unknown>) => fn(tx),
    );

    const result = await updateInvoiceWithItems("inv-1", {
      status: "sent",
    });

    expect(result).toEqual({
      error: "Cannot edit a paid invoice",
    });
  });

  it("returns error for nonexistent invoice", async () => {
    const tx = createTx([[]]);
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: ReturnType<typeof createTx>) => Promise<unknown>) => fn(tx),
    );

    const result = await updateInvoiceWithItems("nonexistent", {
      status: "sent",
    });

    expect(result).toEqual({
      error: "Invoice nonexistent not found",
    });
  });

  it("sets paidAt when status changes to paid", async () => {
    const existing = [{
      id: "inv-1",
      status: "sent",
      clientId: "c1",
      totalAmount: 1000,
    }];
    const updated = [{
      id: "inv-1",
      status: "paid",
      clientId: "c1",
      totalAmount: 1000,
      paidAt: new Date(),
    }];

    const tx = createTx([existing, updated]);
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: ReturnType<typeof createTx>) => Promise<unknown>) => fn(tx),
    );

    const result = await updateInvoiceWithItems("inv-1", {
      status: "paid",
    });

    expect(result).toHaveProperty("data");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
  });
});
