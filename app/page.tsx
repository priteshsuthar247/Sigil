import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightIcon, ReceiptIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ReceiptIcon />
          </div>
          <CardTitle>Sigil</CardTitle>
          <CardDescription>
            A simple invoicing workspace — manage clients, send invoices, and
            track payments with Sigil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
            Go to dashboard
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
