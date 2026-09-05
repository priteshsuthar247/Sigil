import { z } from "zod";
import { invoiceStatus } from "@/db/schema";

// ── Display types ──────────────────────────────────────────────
// Re-export DB types. Invoice is extended with clientName (from JOIN).
export type { Client, InvoiceItem } from "@/db/schema";
export type InvoiceStatus = (typeof invoiceStatus.enumValues)[number];

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
import { createClientSchema } from "@/db/validators";

export const clientFormSchema = createClientSchema.extend({
  phone: createClientSchema.shape.phone
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  address: createClientSchema.shape.address
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// UI-side schema: accepts decimal prices (dollars), converts to cents before DB
export const invoiceItemFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
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
