import { InvoiceMinimalDocument } from "@/components/pdf/blocks/invoice-minimal/invoice-minimal";
import type { InvoiceMinimalData } from "@/components/pdf/blocks/invoice-minimal/invoice-minimal.types";

export function buildInvoicePdfData(
  invoiceNumber: string,
  invoiceDate: string,
  dueDate: string,
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  },
  items: { description: string; quantity: number; price: number }[],
  totalAmount: number,
  company: {
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    paymentTerms: string;
    gstin: string;
    notes: string;
  },
): InvoiceMinimalData {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  return {
    invoiceNumber,
    invoiceDate,
    dueDate,
    companyName: company.companyName,
    subtitle: `Phone: ${company.companyPhone}`,
    companyAddress: company.companyAddress,
    companyEmail: company.companyEmail,
    billTo: {
      name: client.name,
      address: client.address || "",
      email: client.email,
      phone: client.phone || "",
    },
    items: items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    summary: {
      subtotal,
      tax: 0,
      total: totalAmount,
    },
    paymentTerms: {
      dueDate,
      method: company.paymentTerms,
      gst: company.gstin,
    },
    notes: company.notes,
  };
}

export function InvoicePdf({ data }: { data: InvoiceMinimalData }) {
  return <InvoiceMinimalDocument data={data} />;
}
