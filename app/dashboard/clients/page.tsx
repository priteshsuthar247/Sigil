import { getClients } from "@/server/clients";
import { ClientsPageClient } from "@/components/client/clients-page-client";

export default async function Page() {
  const result = await getClients();
  return <ClientsPageClient clients={result.data ?? []} />;
}
