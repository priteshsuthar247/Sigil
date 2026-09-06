"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  DataTable,
  createTableColumnHelper,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EllipsisVerticalIcon, UsersIcon } from "lucide-react";
import { formatDate, type Client } from "@/lib/schemas";
import { ClientMobileCards } from "./client-mobile-cards";

const columnHelper = createTableColumnHelper<Client>();

function useColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  return useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "Name",
          cell: ({ row }) => (
            <Button
              variant="link"
              className="w-fit px-0 text-left text-foreground font-semibold"
              nativeButton={false}
              render={<Link href={`/dashboard/clients/${row.original.id}`} prefetch={false} />}
            >
              {row.original.name}
            </Button>
          ),
          enableHiding: false,
        }),
        columnHelper.accessor("email", {
          header: "Email",
          cell: ({ row }) => (
            <div className="text-muted-foreground">{row.original.email}</div>
          ),
        }),
        columnHelper.accessor("phone", {
          header: "Phone",
          cell: ({ row }) => (
            <div className="text-muted-foreground">
              {row.original.phone ?? "—"}
            </div>
          ),
        }),
        columnHelper.accessor("address", {
          header: "Address",
          cell: ({ row }) => (
            <div className="text-muted-foreground">
              {row.original.address ?? "—"}
            </div>
          ),
        }),
        columnHelper.accessor("createdAt", {
          header: "Created",
          cell: ({ row }) => (
            <div className="text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </div>
          ),
        }),
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="flex size-8 text-muted-foreground data-open:bg-muted"
                    size="icon"
                  />
                }
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  render={
                    <Link href={`/dashboard/clients/${row.original.id}`} prefetch={false} />
                  }
                >
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [onEdit, onDelete],
  );
}

const emptyState = (
  <Empty>
    <EmptyMedia variant="icon">
      <UsersIcon />
    </EmptyMedia>
    <EmptyHeader>
      <EmptyTitle>No clients yet</EmptyTitle>
      <EmptyDescription>
        Add your first client to start invoicing.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

export function ClientTable({
  clients,
  onEdit,
  onDelete,
  isLoading = false,
  onSort,
  sortBy,
  sortDir,
  onCreateInvoice,
}: {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  isLoading?: boolean;
  onSort?: (columnId: string) => void;
  sortBy?: string;
  sortDir?: string;
  onCreateInvoice?: (clientId: string) => void;
}) {
  const columns = useColumns({ onEdit, onDelete });
  return (
    <>
      <div className="hidden md:block">
        <DataTable
          data={clients}
          columns={columns}
          getRowId={(row) => row.id}
          emptyState={emptyState}
          isLoading={isLoading}
          hidePagination
          onSort={onSort}
          initialPageSize={clients.length || 10}
          sortBy={sortBy}
          sortDir={sortDir}
        />
      </div>
      <ClientMobileCards clients={clients} onEdit={onEdit} onDelete={onDelete} onCreateInvoice={onCreateInvoice} />
    </>
  );
}
