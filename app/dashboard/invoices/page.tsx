import { getInvoices } from "@/server/invoices";
import { getClients } from "@/server/clients";
import { InvoicesPageClient } from "@/components/invoice/invoices-page-client";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; sortBy?: string; sortDir?: string; limit?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = params.status ?? "all";
  const sortBy = params.sortBy ?? "createdAt";
  const sortDir = params.sortDir ?? "desc";
  const limit = Number(params.limit ?? "10");

  const [invoicesResult, clientsResult] = await Promise.all([
    getInvoices({ page, limit, status, sortBy, sortDir }),
    getClients({ page: 1, limit: 1000 }),
  ]);

  return (
    <InvoicesPageClient
      invoices={invoicesResult.data ?? []}
      total={invoicesResult.total ?? 0}
      page={page}
      limit={limit}
      clients={clientsResult.data ?? []}
      status={status}
      sortBy={sortBy}
      sortDir={sortDir}
    />
  );
}
