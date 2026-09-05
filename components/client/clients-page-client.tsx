"use client";

import { useState, useEffect, useRef } from "react";
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
import { PlusIcon, UserIcon, SearchIcon, XIcon } from "lucide-react";
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
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

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

  const handleSort = (columnId: string) => {
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
  };

  return (
    <div className="flex flex-col gap-6">
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clients" }
      ]} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or email"
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
          {(searchParams.get("q") || searchParams.get("sortBy") || searchParams.get("sortDir")) && (
            <Button size="sm" variant="ghost" onClick={() => { const params = new URLSearchParams(); params.set("page", "1"); router.replace(`${pathname}?${params.toString()}`); setSearchValue(""); }}>
              Clear
            </Button>
          )}
        </div>
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
            onSort={handleSort}
            sortBy={sortBy}
            sortDir={sortDir}
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
