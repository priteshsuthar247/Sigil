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
import { invoiceItemFormSchema } from "@/db/validators";

export const clientFormSchema = createClientSchema.extend({
  phone: createClientSchema.shape.phone
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  address: createClientSchema.shape.address
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

export { invoiceItemFormSchema };
export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;

// ── Utilities ──────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
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
