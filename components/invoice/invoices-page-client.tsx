"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import {
  InvoiceFilters,
  type InvoiceFilter,
} from "@/components/invoice/invoice-filters";
import { InvoiceFormDialog } from "@/components/invoice/invoice-form-dialog";
import type { Client, Invoice } from "@/lib/schemas";

export function InvoicesPageClient({
  invoices,
  clients,
}: {
  invoices: Invoice[];
  clients: Client[];
}) {
  const [filter, setFilter] = React.useState<InvoiceFilter>("all");
  const [open, setOpen] = React.useState(false);

  const filtered: Invoice[] = React.useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter((inv) => inv.status === filter);
  }, [filter, invoices]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <InvoiceFilters value={filter} onChange={setFilter} />
        <Button size="sm" onClick={() => setOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Invoice
        </Button>
      </div>
      <InvoiceTable invoices={filtered} />
      <InvoiceFormDialog
        open={open}
        onOpenChange={setOpen}
        clients={clients}
      />
    </div>
  );
}
