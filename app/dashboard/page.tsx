import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ReceiptIcon, UsersIcon } from "lucide-react";
import { invoices } from "@/lib/mock/invoices";
import { clients } from "@/lib/mock/clients";
import { formatCurrency } from "@/lib/schemas";

export default function Page() {
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <ReceiptIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <ReceiptIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/invoices" />}>
            View all
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">#{inv.number}</span>
                  <span className="text-xs text-muted-foreground">{inv.clientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(inv.totalAmount)}</span>
                  <span className={`ml-2 text-xs ${inv.status === "paid" ? "text-green-600" : "text-muted-foreground"}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
