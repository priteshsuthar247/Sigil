"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import {
  InvoiceFilters,
  type InvoiceFilter,
} from "@/components/invoice/invoice-filters";
import { InvoiceFormDialog } from "@/components/invoice/invoice-form-dialog";
import {
  deleteInvoice,
  duplicateInvoice,
  updateInvoiceWithItems,
} from "@/server/invoices";
import type { Client, Invoice } from "@/lib/schemas";

export function InvoicesPageClient({
  invoices,
  clients,
}: {
  invoices: Invoice[];
  clients: Client[];
}) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<InvoiceFilter>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Invoice | null>(null);
  const [markPaidTarget, setMarkPaidTarget] = React.useState<Invoice | null>(
    null,
  );

  const filtered: Invoice[] = React.useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter((inv) => inv.status === filter);
  }, [filter, invoices]);

  const handleEdit = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleMarkPaid = async () => {
    if (!markPaidTarget) return;
    await updateInvoiceWithItems(markPaidTarget.id, { status: "paid" });
    setMarkPaidTarget(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteInvoice(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  };

  const handleDuplicate = async (invoice: Invoice) => {
    await duplicateInvoice(invoice.id);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <InvoiceFilters value={filter} onChange={setFilter} />
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Invoice
        </Button>
      </div>
      <InvoiceTable
        invoices={filtered}
        onEdit={handleEdit}
        onMarkPaid={(inv) => setMarkPaidTarget(inv)}
        onDelete={(inv) => setDeleteTarget(inv)}
        onDuplicate={handleDuplicate}
      />
      <InvoiceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clients={clients}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice #{deleteTarget?.number}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!markPaidTarget}
        onOpenChange={(open) => {
          if (!open) setMarkPaidTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark invoice #{markPaidTarget?.number} as paid. The paid
              date will be set to today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
