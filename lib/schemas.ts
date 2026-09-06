import { z } from "zod";
import { invoiceStatus } from "@/db/schema";

// ── Display types ──────────────────────────────────────────────
// Re-export DB types. Invoice is extended with clientName (from JOIN).
export type { Client, InvoiceItem } from "@/db/schema";
export type InvoiceStatus = (typeof invoiceStatus.enumValues)[number];

export type ActionResult<T> =
  | { data: T }
  | { error: string | { formErrors: string[]; fieldErrors?: Record<string, string[]> } };

export type Invoice = {
  id: string;
  number: number;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAt: Date | null;
  createdAt: Date;
};

// ── Form schemas (reuse drizzle-zod validators) ────────────────
import { createClientSchema, invoiceItemSchema } from "@/db/validators";

export const clientFormSchema = createClientSchema.extend({
  phone: createClientSchema.shape.phone
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  address: createClientSchema.shape.address
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// UI-side schema for invoice items – reuse validator schema, allow decimal input for UX
export const invoiceItemFormSchema = invoiceItemSchema.extend({
  price: z.number().nonnegative("Price must be non-negative"),
});
export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;

// ── Utilities ──────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
