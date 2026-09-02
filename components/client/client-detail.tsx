"use client";

import * as React from "react";
import Link from "next/link";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate, type Client, type Invoice } from "@/lib/schemas";

export function ClientDetail({
  client,
  invoices,
  allInvoicesHref = "/dashboard/invoices",
}: {
  client: Client;
  invoices: Invoice[];
  allInvoicesHref?: string;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
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
              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    />
                  }
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete client?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {client.name} from your
                      clients. Their invoices will be deleted as well.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          <Button size="sm" nativeButton={false} render={<Link href={allInvoicesHref} />}>
            <PlusIcon data-icon="inline-start" />
            New Invoice
          </Button>
        </div>
        <InvoiceTable invoices={invoices} />
      </div>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />
    </div>
  );
}
