import { getInvoices } from "@/server/invoices";
import { getClients } from "@/server/clients";
import { InvoicesPageClient } from "@/components/invoice/invoices-page-client";

export default async function Page() {
  const [invoicesResult, clientsResult] = await Promise.all([
    getInvoices(),
    getClients(),
  ]);

  return (
    <InvoicesPageClient
      invoices={invoicesResult.data ?? []}
      clients={clientsResult.data ?? []}
    />
  );
}
