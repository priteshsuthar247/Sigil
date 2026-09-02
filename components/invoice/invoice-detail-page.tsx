"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { deleteInvoice, updateInvoiceWithItems } from "@/server/invoices";
import type { Invoice, InvoiceItem } from "@/lib/schemas";

export function InvoiceDetailPage({
  invoice,
  items,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [markPaidOpen, setMarkPaidOpen] = React.useState(false);

  const handleEdit = () => {
    // TODO: open edit dialog or navigate to edit page
    // For now, navigate back to invoice list
    router.push("/dashboard/invoices");
  };

  const handleMarkPaid = async () => {
    await updateInvoiceWithItems(invoice.id, { status: "paid" });
    setMarkPaidOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteInvoice(invoice.id);
    setDeleteOpen(false);
    router.push("/dashboard/invoices");
  };

  return (
    <>
      <InvoiceDetail
        invoice={invoice}
        items={items}
        onEdit={handleEdit}
        onMarkPaid={() => setMarkPaidOpen(true)}
        onDelete={() => setDeleteOpen(true)}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
