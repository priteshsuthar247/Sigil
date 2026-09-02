"use client";

import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/lib/schemas";

export type InvoiceFilter = "all" | InvoiceStatus;

const filters: { value: InvoiceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
];

export function InvoiceFilters({
  value,
  onChange,
}: {
  value: InvoiceFilter;
  onChange: (value: InvoiceFilter) => void;
}) {
  return (
    <div className="flex gap-1">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={value === f.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
