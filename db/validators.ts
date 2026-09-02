import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { clients, invoiceStatus } from "./schema";

const clientInsertSchema = createInsertSchema(clients);

export const createClientSchema = clientInsertSchema
  .pick({ name: true, email: true, phone: true, address: true })
  .extend({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7).max(20).optional(),
    address: z.string().max(500).optional(),
  });

export const clientUpdateSchema = createClientSchema.partial();

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
