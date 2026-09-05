import { getClients } from "@/server/clients";
import { ClientsPageClient } from "@/components/client/clients-page-client";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; sortBy?: string; sortDir?: string; limit?: string; q?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const sortBy = params.sortBy ?? "name";
  const sortDir = params.sortDir ?? "asc";
  const limit = Number(params.limit ?? "10");
  const q = params.q ?? "";

  const result = await getClients({ page, limit, sortBy, sortDir, q });
  return <ClientsPageClient clients={result.data ?? []} total={result.total ?? 0} page={page} limit={limit} sortBy={sortBy} sortDir={sortDir} />;
}
