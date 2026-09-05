"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { PlusIcon } from "lucide-react";
import { ClientTable } from "@/components/client/client-table";
import { ClientFormDialog } from "@/components/client/client-form-dialog";
import { deleteClient } from "@/server/clients";
import type { Client } from "@/lib/schemas";

export function ClientsPageClient({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const createBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [pathname, clients]);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setRefreshing(true);
    try {
      await deleteClient(deleteTarget.id);
      toast.success(`Client ${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete client");
      setRefreshing(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" ref={createBtnRef} onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Client
        </Button>
      </div>
      <ClientTable
        clients={clients}
        onEdit={(client) => setEditClient(client)}
        onDelete={(client) => setDeleteTarget(client)}
        isLoading={refreshing}
      />
      <ClientFormDialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) setTimeout(() => createBtnRef.current?.focus(), 0);
      }} />
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
