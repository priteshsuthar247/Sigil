"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { Trash2Icon, PlusIcon } from "lucide-react";
import {
  formatCurrency,
  type InvoiceItemFormValues,
} from "@/lib/schemas";

export type InvoiceItemRow = InvoiceItemFormValues & {
  id: string;
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

function emptyRow(): InvoiceItemRow {
  return { id: makeId(), description: "", quantity: 1, price: 0 };
}

export function InvoiceItemsEditor({
  value,
  onChange,
}: {
  value: InvoiceItemRow[];
  onChange: (next: InvoiceItemRow[]) => void;
}) {
  const updateRow = (id: string, patch: Partial<InvoiceItemRow>) => {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    onChange(value.filter((r) => r.id !== id));
  };

  const addRow = () => {
    onChange([...value, emptyRow()]);
  };

  const total = value.reduce((sum, r) => sum + r.quantity * r.price, 0);

  return (
    <FieldGroup>
      <div className="flex items-end justify-between gap-2">
        <Label className="text-sm font-medium">Items</Label>
        <span className="text-sm text-muted-foreground tabular-nums">
          Total: {formatCurrency(total)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {value.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-12 items-end gap-2 rounded-lg border p-3"
          >
            <Field className="col-span-12 md:col-span-6">
              <Label htmlFor={`desc-${row.id}`} className="sr-only">
                Description
              </Label>
              <Input
                id={`desc-${row.id}`}
                value={row.description}
                onChange={(e) =>
                  updateRow(row.id, { description: e.target.value })
                }
                placeholder="Description"
              />
            </Field>
            <Field className="col-span-4 md:col-span-2">
              <Label htmlFor={`qty-${row.id}`} className="sr-only">
                Quantity
              </Label>
              <Input
                id={`qty-${row.id}`}
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) =>
                  updateRow(row.id, {
                    quantity: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />
            </Field>
            <Field className="col-span-4 md:col-span-2">
              <Label htmlFor={`price-${row.id}`} className="sr-only">
                Price
              </Label>
              <Input
                id={`price-${row.id}`}
                type="number"
                min={0}
                step="0.01"
                value={(row.price / 100).toFixed(2)}
                onChange={(e) =>
                  updateRow(row.id, {
                    price: Math.max(
                      0,
                      Math.round(Number(e.target.value || 0) * 100),
                    ),
                  })
                }
              />
            </Field>
            <div className="col-span-3 flex items-center justify-end text-sm tabular-nums text-muted-foreground md:col-span-1">
              {formatCurrency(row.quantity * row.price)}
            </div>
            <div className="col-span-1 flex items-end justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                aria-label="Remove item"
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={addRow}
      >
        <PlusIcon data-icon="inline-start" />
        Add item
      </Button>
    </FieldGroup>
  );
}

export function makeInitialItemRows(): InvoiceItemRow[] {
  return [emptyRow()];
}
