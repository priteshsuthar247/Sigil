import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, CheckCircle2Icon, Trash2Icon } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import {
  formatCurrency,
  formatDate,
  type Invoice,
  type InvoiceItem,
} from "@/lib/schemas";

export function InvoiceDetail({
  invoice,
  items,
  onEdit,
  onMarkPaid,
  onDelete,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  onEdit?: () => void;
  onMarkPaid?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span>Invoice #{invoice.number}</span>
          <InvoiceStatusBadge status={invoice.status} />
        </CardTitle>
        <CardDescription>
          For{" "}
          <Link
            href={`/dashboard/clients/${invoice.clientId}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {invoice.clientName}
          </Link>
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            {onEdit && invoice.status !== "paid" ? (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
            ) : null}
            {onMarkPaid && invoice.status !== "paid" ? (
              <Button variant="outline" size="sm" onClick={onMarkPaid}>
                <CheckCircle2Icon data-icon="inline-start" />
                Mark as paid
              </Button>
            ) : null}
            {onDelete && invoice.status !== "paid" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive"
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
            ) : null}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(invoice.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Paid</p>
            <p className="font-medium">{formatDate(invoice.paidAt)}</p>
          </div>
        </div>

        <Separator />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-20 text-right">Qty</TableHead>
                <TableHead className="w-28 text-right">Price</TableHead>
                <TableHead className="w-32 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(item.quantity * item.price)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items on this invoice.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-6">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(invoice.totalAmount)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
