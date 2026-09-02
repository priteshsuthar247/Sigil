import { notFound } from "next/navigation";
import { clients } from "@/lib/mock/clients";
import { invoices } from "@/lib/mock/invoices";
import { ClientDetail } from "@/components/client/client-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const clientInvoices = invoices.filter((inv) => inv.clientId === id);

  return (
    <ClientDetail
      client={client}
      invoices={clientInvoices}
      allInvoicesHref="/dashboard/invoices"
    />
  );
}
