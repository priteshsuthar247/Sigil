"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  total = 0,
  page = 1,
  limit = 10,
  status = "all",
  sortBy = "createdAt",
  sortDir = "desc",
}: {
  invoices: Invoice[];
  clients: Client[];
  total?: number;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortDir?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [markPaidTarget, setMarkPaidTarget] = useState<Invoice | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        <InvoiceFilters value={status === "all" ? "all" : status as InvoiceFilter} onChange={(v) => { const params = new URLSearchParams(searchParams.toString()); if (v === "all") params.delete("status"); else params.set("status", v); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); }} />
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Invoice
        </Button>
      </div>
      {invoices.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <ReceiptIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {status === "all"
                ? "No invoices yet"
                : status === "sent"
                ? "No sent invoices"
                : "No paid invoices"}
            </EmptyTitle>
            <EmptyDescription>
              {status === "all"
                ? "Create your first invoice to get started."
                : `Switch to “All” or create a ${status} invoice.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <InvoiceTable
            invoices={invoices}
            onEdit={handleEdit}
            onMarkPaid={(inv) => setMarkPaidTarget(inv)}
            onDelete={(inv) => setDeleteTarget(inv)}
            isLoading={refreshing}
          />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>Showing {invoices.length} of {total} invoices</div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select value={String(limit)} onValueChange={(value) => {
                  if (!value) return;
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("limit", value);
                  params.set("page", "1");
                  router.replace(`${pathname}?${params.toString()}`);
                }}>
                  <SelectTrigger className="h-8 w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10,20,30,50,100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(page - 1)); router.replace(`${pathname}?${params.toString()}`); }}>Previous</Button>
              <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(page + 1)); router.replace(`${pathname}?${params.toString()}`); }}>Next</Button>
            </div>
          </div>
        </div>
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
