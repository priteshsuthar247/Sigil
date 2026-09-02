import { notFound } from "next/navigation";
import { getInvoiceById } from "@/server/invoices";
import { getInvoiceItemsByInvoiceId } from "@/server/invoiceItems";
import { InvoiceDetail } from "@/components/invoice/invoice-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoiceResult, itemsResult] = await Promise.all([
    getInvoiceById(id),
    getInvoiceItemsByInvoiceId(id),
  ]);

  const invoice = invoiceResult.data;
  if (!invoice) notFound();

  return <InvoiceDetail invoice={invoice} items={itemsResult.data ?? []} />;
}
