import { getClients } from "@/server/clients";
import { ClientsPageClient } from "@/components/client/clients-page-client";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; sortBy?: string; sortDir?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const sortBy = params.sortBy ?? "name";
  const sortDir = params.sortDir ?? "asc";

  const result = await getClients({ page, limit: 10, sortBy, sortDir });
  return <ClientsPageClient clients={result.data ?? []} total={result.total ?? 0} page={page} sortBy={sortBy} sortDir={sortDir} />;
}
