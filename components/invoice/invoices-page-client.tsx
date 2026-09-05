"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
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
import { PlusIcon, ReceiptIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import {
  InvoiceFilters,
  type InvoiceFilter,
} from "@/components/invoice/invoice-filters";
import { InvoiceFormDialog } from "@/components/invoice/invoice-form-dialog";
import {
  deleteInvoice,
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
  const pathname = usePathname();
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [markPaidTarget, setMarkPaidTarget] = useState<Invoice | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filtered: Invoice[] = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter((inv) => inv.status === filter);
  }, [filter, invoices]);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [pathname, invoices]);

  const handleEdit = useCallback((invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  }, [router]);

  const handleMarkPaid = useCallback(async () => {
    if (!markPaidTarget || markingPaid) return;
    setMarkingPaid(true);
    setRefreshing(true);
    try {
      await updateInvoiceWithItems(markPaidTarget.id, { status: "paid" });
      toast.success(`Invoice #${markPaidTarget.number} marked as paid`);
      setMarkPaidTarget(null);
      router.refresh();
    } catch {
      toast.error("Failed to mark invoice as paid");
      setRefreshing(false);
    } finally {
      setMarkingPaid(false);
    }
  }, [markPaidTarget, router, markingPaid]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setRefreshing(true);
    try {
      await deleteInvoice(deleteTarget.id);
      toast.success(`Invoice #${deleteTarget.number} deleted`);
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete invoice");
      setRefreshing(false);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, router, deleting]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <InvoiceFilters value={filter} onChange={setFilter} />
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Invoice
        </Button>
      </div>
      {filtered.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <ReceiptIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {filter === "all"
                ? "No invoices yet"
                : filter === "sent"
                ? "No sent invoices"
                : "No paid invoices"}
            </EmptyTitle>
            <EmptyDescription>
              {filter === "all"
                ? "Create your first invoice to get started."
                : `Switch to “All” or create a ${filter} invoice.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InvoiceTable
          invoices={filtered}
          onEdit={handleEdit}
          onMarkPaid={(inv) => setMarkPaidTarget(inv)}
          onDelete={(inv) => setDeleteTarget(inv)}
          isLoading={refreshing}
        />
      )}
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
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
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
            <AlertDialogCancel disabled={markingPaid}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid} disabled={markingPaid}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
