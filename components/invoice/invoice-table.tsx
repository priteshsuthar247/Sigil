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
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EllipsisVerticalIcon, ReceiptIcon } from "lucide-react";
import { formatCurrency, formatDate, type Invoice } from "@/lib/schemas";
import type { ColumnDef } from "@tanstack/react-table";

const columnHelper = createTableColumnHelper<Invoice>();

function useColumns(): ColumnDef<typeof features, Invoice>[] {
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
        columnHelper.accessor("number", {
          header: "Invoice #",
          cell: ({ row }) => (
            <Button
              variant="link"
              className="w-fit px-0 text-left text-foreground"
              nativeButton={false}
              render={<Link href={`/dashboard/invoices/${row.original.id}`} />}
            >
              #{row.original.number}
            </Button>
          ),
          enableHiding: false,
        }),
        columnHelper.accessor("clientName", {
          header: "Client",
          cell: ({ row }) => (
            <div className="font-medium">{row.original.clientName}</div>
          ),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
        }),
        columnHelper.accessor("totalAmount", {
          header: () => <div className="w-full text-right">Total</div>,
          cell: ({ row }) => (
            <div className="text-right tabular-nums font-medium">
              {formatCurrency(row.original.totalAmount)}
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
        columnHelper.accessor("paidAt", {
          header: "Paid",
          cell: ({ row }) => (
            <div className="text-muted-foreground">
              {formatDate(row.original.paidAt)}
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
                    <Link href={`/dashboard/invoices/${row.original.id}`} />
                  }
                >
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                {row.original.status !== "paid" ? (
                  <DropdownMenuItem>Mark as paid</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
      <ReceiptIcon />
    </EmptyMedia>
    <EmptyHeader>
      <EmptyTitle>No invoices yet</EmptyTitle>
      <EmptyDescription>
        Create your first invoice to get started.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const columns = useColumns();
  return (
    <DataTable
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      emptyState={emptyState}
    />
  );
}
