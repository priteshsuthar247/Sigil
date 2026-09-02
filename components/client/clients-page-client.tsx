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
import { ClientTable } from "@/components/client/client-table";
import { ClientFormDialog } from "@/components/client/client-form-dialog";
import { deleteClient } from "@/server/clients";
import type { Client } from "@/lib/schemas";

export function ClientsPageClient({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editClient, setEditClient] = React.useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteClient(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Client
        </Button>
      </div>
      <ClientTable
        clients={clients}
        onEdit={(client) => setEditClient(client)}
        onDelete={(client) => setDeleteTarget(client)}
      />
      <ClientFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editClient ? (
        <ClientFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditClient(null);
          }}
          client={editClient}
        />
      ) : null}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.name} from your
              clients. Their invoices will be deleted as well.
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
    </div>
  );
}
