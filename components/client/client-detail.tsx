"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import { InvoiceFormDialog } from "@/components/invoice/invoice-form-dialog";
import { ClientFormDialog } from "@/components/client/client-form-dialog";
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
import { deleteClient } from "@/server/clients";
import { formatDate, type Client, type Invoice } from "@/lib/schemas";

export function ClientDetail({
  client,
  invoices,
}: {
  client: Client;
  invoices: Invoice[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success(`Client ${client.name} deleted`);
      router.push("/dashboard/clients");
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clients", href: "/dashboard/clients" },
        { label: client.name }
      ]} />
      <Card>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
          <CardDescription>
            Added {formatDate(client.createdAt)}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{client.email}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{client.phone ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{client.address ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Invoices</h2>
          <Button size="sm" onClick={() => setInvoiceOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            New Invoice
          </Button>
        </div>
        <InvoiceTable invoices={invoices} />
      </div>

      <InvoiceFormDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        clients={[client]}
        defaultClientId={client.id}
      />

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {client.name} from your
              clients. Their invoices will be deleted as well.
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
    </div>
  );
}
