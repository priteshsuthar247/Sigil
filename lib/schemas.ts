import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  description: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().int().nonnegative(),
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceStatusSchema = z.enum(["sent", "paid"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  clientId: z.string(),
  clientName: z.string(),
  status: invoiceStatusSchema,
  totalAmount: z.number().int().nonnegative(),
  createdAt: z.date(),
  paidAt: z.date().nullable(),
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.date(),
});
export type Client = z.infer<typeof clientSchema>;

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 characters").max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const invoiceItemFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().int().nonnegative("Price must be a non-negative integer"),
});
export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;

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
