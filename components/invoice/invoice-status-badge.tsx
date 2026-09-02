import { Badge } from "@/components/ui/badge";
import { CircleCheckIcon, LoaderIcon } from "lucide-react";
import type { InvoiceStatus } from "@/lib/schemas";

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  if (status === "paid") {
    return (
      <Badge variant="default" className={className}>
        <CircleCheckIcon data-icon="inline-start" />
        Paid
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={className}>
      <LoaderIcon data-icon="inline-start" />
      Sent
    </Badge>
  );
}
