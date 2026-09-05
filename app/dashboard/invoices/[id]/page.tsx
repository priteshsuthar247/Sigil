import { notFound } from "next/navigation";
import { getInvoiceById } from "@/server/invoices";
import { getInvoiceItemsByInvoiceId } from "@/server/invoiceItems";
import { getClients } from "@/server/clients";
import { InvoiceDetailPage } from "@/components/invoice/invoice-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoiceResult, itemsResult, clientsResult] = await Promise.all([
    getInvoiceById(id),
    getInvoiceItemsByInvoiceId(id),
    getClients(),
  ]);

  const invoice = invoiceResult.data;
  if (!invoice) notFound();

  return <InvoiceDetailPage invoice={invoice} items={itemsResult.data ?? []} clients={clientsResult.data ?? []} />;
}
