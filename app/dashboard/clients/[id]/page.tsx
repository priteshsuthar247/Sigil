import { notFound } from "next/navigation";
import { getClientById } from "@/server/clients";
import { getInvoices } from "@/server/invoices";
import { ClientDetail } from "@/components/client/client-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [clientResult, invoicesResult] = await Promise.all([
    getClientById(id),
    getInvoices(),
  ]);

  const client = clientResult.data;
  if (!client) notFound();

  const clientInvoices = (invoicesResult.data ?? []).filter(
    (inv) => inv.clientId === id,
  );

  return (
    <ClientDetail
      client={client}
      invoices={clientInvoices}
    />
  );
}
