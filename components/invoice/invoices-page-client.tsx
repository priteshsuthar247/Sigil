"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PlusIcon, ReceiptIcon, SearchIcon, XIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
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
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

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

  const handleSort = useCallback((columnId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSortBy = params.get("sortBy");
    const currentSortDir = params.get("sortDir");
    if (currentSortBy === columnId) {
      if (currentSortDir === "asc") {
        params.set("sortDir", "desc");
      } else if (currentSortDir === "desc") {
        params.delete("sortBy");
        params.delete("sortDir");
      } else {
        params.set("sortDir", "asc");
      }
    } else {
      params.set("sortBy", columnId);
      params.set("sortDir", "asc");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, sortBy, sortDir]);

  return (
    <div className="flex flex-col gap-6">
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Invoices" }
      ]} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search # or client"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { const params = new URLSearchParams(searchParams.toString()); if (searchValue.trim()) params.set("q", searchValue.trim()); else params.delete("q"); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); } }}
              className="w-[220px]"
            />
            <Button size="sm" variant="outline" aria-label="Search" onClick={() => { const params = new URLSearchParams(searchParams.toString()); if (searchValue.trim()) params.set("q", searchValue.trim()); else params.delete("q"); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); }}>
              <SearchIcon className="h-4 w-4" />
            </Button>
            {searchValue && (
              <Button size="sm" variant="ghost" aria-label="Clear search" onClick={() => { setSearchValue(""); const params = new URLSearchParams(searchParams.toString()); params.delete("q"); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); }}>
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <InvoiceFilters value={status === "all" ? "all" : status as InvoiceFilter} onChange={(v) => { const params = new URLSearchParams(searchParams.toString()); if (v === "all") params.delete("status"); else params.set("status", v); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); }} />
          {(searchParams.get("q") || searchParams.get("status") || searchParams.get("sortBy") || searchParams.get("sortDir")) && (
            <Button size="sm" variant="ghost" onClick={() => { const params = new URLSearchParams(); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); setSearchValue(""); }}>
              Clear
            </Button>
          )}
        </div>
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
          {status === "all" && (
            <EmptyContent>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                New Invoice
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <InvoiceTable
            invoices={invoices}
            onEdit={handleEdit}
            onMarkPaid={(inv) => setMarkPaidTarget(inv)}
            onDelete={(inv) => setDeleteTarget(inv)}
            isLoading={refreshing}
            onSort={handleSort}
            sortBy={sortBy}
            sortDir={sortDir}
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
                  <SelectTrigger className="w-[90px]">
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
