"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { formatCurrency, formatDate, type Invoice } from "@/lib/schemas";
import { PencilIcon, CheckCircle2Icon, Trash2Icon, EyeIcon } from "lucide-react";

interface InvoiceMobileCardsProps {
  invoices: Invoice[];
  onEdit?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

export function InvoiceMobileCards({ invoices, onEdit, onMarkPaid, onDelete }: InvoiceMobileCardsProps) {
  return (
    <div className="block md:hidden space-y-3">
      {invoices.map((inv) => (
        <Card key={inv.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">#{inv.number}</CardTitle>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  <Link href={`/dashboard/clients/${inv.clientId}`} className="hover:underline">
                    {inv.clientName}
                  </Link>
                </div>
              </div>
              <InvoiceStatusBadge status={inv.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium tabular-nums">{formatCurrency(inv.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(inv.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{inv.paidAt ? formatDate(inv.paidAt) : "—"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 pt-3">
            <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/dashboard/invoices/${inv.id}`} />}>
                <EyeIcon className="h-4 w-4" />
                View
            </Button>
            {onEdit && inv.status !== "paid" && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(inv)}>
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onMarkPaid && inv.status !== "paid" && (
              <Button size="sm" variant="ghost" onClick={() => onMarkPaid(inv)}>
                <CheckCircle2Icon className="h-4 w-4" />
                Mark paid
              </Button>
            )}
            {onDelete && inv.status !== "paid" && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(inv)}>
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
