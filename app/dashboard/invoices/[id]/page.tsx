import { notFound } from "next/navigation";
import { getInvoiceById } from "@/server/invoices";
import { getInvoiceItemsByInvoiceId } from "@/server/invoiceItems";
import { InvoiceDetailPage } from "@/components/invoice/invoice-detail-page";

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

  return <InvoiceDetailPage invoice={invoice} items={itemsResult.data ?? []} />;
}
