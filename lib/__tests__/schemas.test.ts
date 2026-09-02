import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, clientFormSchema, invoiceItemFormSchema } from "@/lib/schemas";

describe("formatCurrency", () => {
  it("formats cents to dollars", () => {
    expect(formatCurrency(1999)).toBe("$19.99");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats whole dollar amounts", () => {
    expect(formatCurrency(100)).toBe("$1.00");
  });

  it("formats large amounts with commas", () => {
    expect(formatCurrency(155000)).toBe("$1,550.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-100)).toBe("-$1.00");
  });

  it("formats single cent", () => {
    expect(formatCurrency(1)).toBe("$0.01");
  });
});

describe("formatDate", () => {
  it("returns em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a date string", () => {
    expect(formatDate("2024-01-15")).toBe("Jan 15, 2024");
  });

  it("formats a Date object", () => {
    expect(formatDate(new Date("2025-03-02"))).toBe("Mar 2, 2025");
  });

  it("returns em dash for invalid date string", () => {
    expect(formatDate("invalid")).toBe("—");
  });

  it("returns em dash for invalid Date object", () => {
    expect(formatDate(new Date("invalid"))).toBe("—");
  });
});

describe("clientFormSchema", () => {
  const validClient = {
    name: "Acme Corp",
    email: "billing@acme.com",
  };

  it("passes with valid required fields", () => {
    const result = clientFormSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it("coerces empty phone to undefined", () => {
    const result = clientFormSchema.safeParse({ ...validClient, phone: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBeUndefined();
  });

  it("coerces empty address to undefined", () => {
    const result = clientFormSchema.safeParse({ ...validClient, address: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.address).toBeUndefined();
  });

  it("passes with valid phone and address", () => {
    const result = clientFormSchema.safeParse({
      ...validClient,
      phone: "+1-555-0101",
      address: "123 Main St",
    });
    expect(result.success).toBe(true);
  });

  it("fails with missing name", () => {
    const result = clientFormSchema.safeParse({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = clientFormSchema.safeParse({
      name: "Test",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("invoiceItemFormSchema", () => {
  const validItem = {
    description: "Website redesign",
    quantity: 1,
    price: 19.99,
  };

  it("passes with valid decimal price", () => {
    const result = invoiceItemFormSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("passes with zero price", () => {
    const result = invoiceItemFormSchema.safeParse({ ...validItem, price: 0 });
    expect(result.success).toBe(true);
  });

  it("passes with integer price", () => {
    const result = invoiceItemFormSchema.safeParse({ ...validItem, price: 20 });
    expect(result.success).toBe(true);
  });

  it("fails with negative price", () => {
    const result = invoiceItemFormSchema.safeParse({ ...validItem, price: -5 });
    expect(result.success).toBe(false);
  });

  it("fails with quantity less than 1", () => {
    const result = invoiceItemFormSchema.safeParse({ ...validItem, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("fails with empty description", () => {
    const result = invoiceItemFormSchema.safeParse({
      ...validItem,
      description: "",
    });
    expect(result.success).toBe(false);
  });
});
