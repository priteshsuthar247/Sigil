import { notFound } from "next/navigation";
import { invoices } from "@/lib/mock/invoices";
import { invoiceItems } from "@/lib/mock/invoice-items";
import { InvoiceDetail } from "@/components/invoice/invoice-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) notFound();

  const items = invoiceItems.filter((it) => it.invoiceId === id);

  return <InvoiceDetail invoice={invoice} items={items} />;
}
