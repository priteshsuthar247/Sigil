"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as InvoiceFilter)}
      className="w-full"
    >
      <TabsList className="hidden @4xl/main:flex">
        {filters.map((f) => (
          <TabsTrigger key={f.value} value={f.value}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex @4xl/main:hidden">
        <Select
          value={value}
          onValueChange={(v) => {
            if (v) onChange(v as InvoiceFilter);
          }}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filters.map((f) => (
        <TabsContent key={f.value} value={f.value} className="hidden" />
      ))}
    </Tabs>
  );
}
