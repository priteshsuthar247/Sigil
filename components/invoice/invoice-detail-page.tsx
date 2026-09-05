"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
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
import { InvoiceDetail } from "@/components/invoice/invoice-detail";
import { InvoiceFormDialog } from "@/components/invoice/invoice-form-dialog";
import { deleteInvoice, updateInvoiceWithItems } from "@/server/invoices";
import type { Client, Invoice, InvoiceItem } from "@/lib/schemas";

export function InvoiceDetailPage({
  invoice,
  items,
  clients,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  clients: Client[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      await updateInvoiceWithItems(invoice.id, { status: "paid" });
      toast.success(`Invoice #${invoice.number} marked as paid`);
      setMarkPaidOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to mark invoice as paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteInvoice(invoice.id);
      toast.success(`Invoice #${invoice.number} deleted`);
      setDeleteOpen(false);
      router.push("/dashboard/invoices");
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Invoices", href: "/dashboard/invoices" },
        { label: `#${invoice.number}` }
      ]} className="mb-4" />
      <InvoiceDetail
        invoice={invoice}
        items={items}
        onEdit={() => setEditOpen(true)}
        onMarkPaid={() => setMarkPaidOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <InvoiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        invoice={invoice}
        items={items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          price: i.price,
        }))}
        clients={clients}
      />


      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice #{invoice.number}. This action
              cannot be undone.
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

      <AlertDialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark invoice #{invoice.number} as paid. The paid date
              will be set to today.
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
    </>
  );
}
