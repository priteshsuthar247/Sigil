import { describe, it, expect } from "vitest";
import {
  createClientSchema,
  clientUpdateSchema,
  createInvoiceWithItemsSchema,
  updateInvoiceWithItemsSchema,
} from "@/db/validators";

describe("createClientSchema", () => {
  const validClient = {
    name: "Acme Corp",
    email: "billing@acme.com",
  };

  it("passes with valid required fields", () => {
    const result = createClientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it("passes with all optional fields", () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      phone: "+1-555-0101",
      address: "123 Main St",
    });
    expect(result.success).toBe(true);
  });

  it("fails with missing name", () => {
    const result = createClientSchema.safeParse({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });

  it("fails with empty name", () => {
    const result = createClientSchema.safeParse({
      name: "",
      email: "a@b.com",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = createClientSchema.safeParse({
      name: "Test",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("fails with missing email", () => {
    const result = createClientSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("fails with phone too short", () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("passes with phone of exactly 7 chars", () => {
    const result = createClientSchema.safeParse({
      ...validClient,
      phone: "1234567",
    });
    expect(result.success).toBe(true);
  });
});

describe("clientUpdateSchema", () => {
  it("passes with empty object (all fields optional)", () => {
    const result = clientUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("passes with partial fields", () => {
    const result = clientUpdateSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("fails with invalid email if provided", () => {
    const result = clientUpdateSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("createInvoiceWithItemsSchema", () => {
  const validInput = {
    clientId: "550e8400-e29b-41d4-a716-446655440000",
    items: [
      { description: "Website redesign", quantity: 1, price: 75000 },
    ],
  };

  it("passes with valid input", () => {
    const result = createInvoiceWithItemsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults status to sent", () => {
    const result = createInvoiceWithItemsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("sent");
  });

  it("accepts explicit status", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      status: "paid",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("paid");
  });

  it("fails with missing clientId", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      items: validInput.items,
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid UUID clientId", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      clientId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("fails with empty items array", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("fails with item quantity less than 1", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      items: [{ description: "Test", quantity: 0, price: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it("fails with negative item price", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      items: [{ description: "Test", quantity: 1, price: -100 }],
    });
    expect(result.success).toBe(false);
  });

  it("fails with empty item description", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      items: [{ description: "", quantity: 1, price: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional userId", () => {
    const result = createInvoiceWithItemsSchema.safeParse({
      ...validInput,
      userId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateInvoiceWithItemsSchema", () => {
  it("passes with empty object (all fields optional)", () => {
    const result = updateInvoiceWithItemsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("passes with partial fields", () => {
    const result = updateInvoiceWithItemsSchema.safeParse({
      status: "paid",
    });
    expect(result.success).toBe(true);
  });

  it("passes with items array", () => {
    const result = updateInvoiceWithItemsSchema.safeParse({
      items: [{ description: "Test", quantity: 1, price: 100 }],
    });
    expect(result.success).toBe(true);
  });

  it("fails with empty items array", () => {
    const result = updateInvoiceWithItemsSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("fails with invalid status", () => {
    const result = updateInvoiceWithItemsSchema.safeParse({
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
