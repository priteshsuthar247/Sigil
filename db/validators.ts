import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clients, invoices, invoiceItems, invoiceStatus } from "./schema";

export const clientSelectSchema = createSelectSchema(clients);
export const clientInsertSchema = createInsertSchema(clients);

export const invoiceSelectSchema = createSelectSchema(invoices);
export const invoiceInsertSchema = createInsertSchema(invoices);

export const invoiceItemSelectSchema = createSelectSchema(invoiceItems);
export const invoiceItemInsertSchema = createInsertSchema(invoiceItems);

export const createClientSchema = clientInsertSchema
  .pick({ name: true, email: true, phone: true, address: true })
  .extend({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7).max(20).optional(),
    address: z.string().max(500).optional(),
  });

export const createInvoiceSchema = invoiceInsertSchema
  .pick({ userId: true, clientId: true, status: true, totalAmount: true })
  .extend({
    userId: z.string().uuid("Invalid user ID"),
    clientId: z.string().uuid("Invalid client ID"),
    status: z.enum(invoiceStatus.enumValues, {
      message: "Invalid invoice status",
    }),
    totalAmount: z
      .number()
      .int()
      .nonnegative("Total amount must be a non-negative integer"),
  });

export const createInvoiceItemSchema = invoiceItemInsertSchema
  .pick({ invoiceId: true, quantity: true, description: true, price: true })
  .extend({
    invoiceId: z.string().uuid("Invalid invoice ID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    description: z.string().min(1, "Description is required"),
    price: z.number().int().nonnegative("Price must be a non-negative integer"),
  });

export const clientUpdateSchema = createClientSchema.partial();
export const invoiceUpdateSchema = createInvoiceSchema.partial();
export const invoiceItemUpdateSchema = createInvoiceItemSchema.partial();

export const createInvoiceWithItemsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  clientId: z.string().uuid("Invalid client ID"),
  status: z.enum(invoiceStatus.enumValues).default("sent"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        price: z
          .number()
          .int()
          .nonnegative("Price must be a non-negative integer"),
      }),
    )
    .min(1, "At least one item is required"),
});

export type CreateInvoiceWithItemsInput = z.infer<
  typeof createInvoiceWithItemsSchema
>;

export const updateInvoiceWithItemsSchema = z.object({
  clientId: z.string().uuid("Invalid client ID").optional(),
  status: z.enum(invoiceStatus.enumValues).optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        price: z
          .number()
          .int()
          .nonnegative("Price must be a non-negative integer"),
      }),
    )
    .min(1, "At least one item is required")
    .optional(),
});

export type UpdateInvoiceWithItemsInput = z.infer<
  typeof updateInvoiceWithItemsSchema
>;
