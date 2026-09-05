"use client";

import * as React from "react";
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

const columnHelper = createTableColumnHelper<Invoice>();

function useColumns({
  onEdit,
  onMarkPaid,
  onDelete,
}: {
  onEdit?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}) {
  return React.useMemo(() => [
    columnHelper.accessor("number", {
      header: "Invoice #",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="w-fit px-0 text-left text-foreground font-semibold"
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
        <Button
          variant="link"
          className="w-fit px-0 text-left text-foreground"
          nativeButton={false}
          render={<Link href={`/dashboard/clients/${row.original.clientId}`} prefetch={false} />}
        >
          <span className="font-medium">{row.original.clientName}</span>
        </Button>
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
    ...(onEdit || onMarkPaid || onDelete
      ? [
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
          render={<Link href={`/dashboard/invoices/${row.original.id}`} prefetch={false} />}
                  >
                    View
                  </DropdownMenuItem>
                  {onEdit && row.original.status !== "paid" && (
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onMarkPaid && row.original.status !== "paid" && (
                    <DropdownMenuItem onClick={() => onMarkPaid(row.original)}>
                      Mark as paid
                    </DropdownMenuItem>
                  )}
                  {(onDelete || onEdit || onMarkPaid) && (
                    <DropdownMenuSeparator />
                  )}
                  {onDelete && row.original.status !== "paid" && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(row.original)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ]
      : []),
  ] as any, [onEdit, onMarkPaid, onDelete]);
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

export function InvoiceTable({
  invoices,
  onEdit,
  onMarkPaid,
  onDelete,
  isLoading = false,
}: {
  invoices: Invoice[];
  onEdit?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  isLoading?: boolean;
}) {
  const columns = useColumns({ onEdit, onMarkPaid, onDelete });
  return (
    <DataTable
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      emptyState={emptyState}
      isLoading={isLoading}
    />
  );
}
