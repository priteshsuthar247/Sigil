"use client";

import * as React from "react";
import Link from "next/link";
import {
  DataTable,
  createTableColumnHelper,
  features,
} from "@/components/data-table";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ColumnDef } from "@tanstack/react-table";

const columnHelper = createTableColumnHelper<Client>();

function useColumns(): ColumnDef<typeof features, Client>[] {
  return React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),
        columnHelper.accessor("name", {
          header: "Name",
          cell: ({ row }) => (
            <Button
              variant="link"
              className="w-fit px-0 text-left text-foreground"
              nativeButton={false}
              render={<Link href={`/dashboard/clients/${row.original.id}`} />}
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
                    <Link href={`/dashboard/clients/${row.original.id}`} />
                  }
                >
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [],
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

export function ClientTable({ clients }: { clients: Client[] }) {
  const columns = useColumns();
  return (
    <DataTable
      data={clients}
      columns={columns}
      getRowId={(row) => row.id}
      emptyState={emptyState}
    />
  );
}
