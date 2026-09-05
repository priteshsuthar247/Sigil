"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { PlusIcon, UserIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ClientTable } from "@/components/client/client-table";
import { ClientFormDialog } from "@/components/client/client-form-dialog";
import { deleteClient } from "@/server/clients";
import type { Client } from "@/lib/schemas";

export function ClientsPageClient({ clients, total = 0, page = 1, limit = 10, sortBy = "name", sortDir = "asc" }: { clients: Client[]; total?: number; page?: number; limit?: number; sortBy?: string; sortDir?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      {clients.length === 0 && !refreshing ? (
        <Empty>
          <EmptyMedia variant="icon">
            <UserIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No clients yet</EmptyTitle>
            <EmptyDescription>
              Create your first client to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New Client
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <ClientTable
            clients={clients}
            onEdit={(client) => setEditClient(client)}
            onDelete={(client) => setDeleteTarget(client)}
            isLoading={refreshing}
          />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>Showing {clients.length} of {total} clients</div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select value={String(limit)} onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (value) {
                    params.set("limit", value);
                    params.set("page", "1");
                    router.replace(`${pathname}?${params.toString()}`);
                  }
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
