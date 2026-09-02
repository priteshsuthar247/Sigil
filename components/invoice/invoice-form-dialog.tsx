"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import {
  InvoiceItemsEditor,
  makeInitialItemRows,
  type InvoiceItemRow,
} from "@/components/invoice/invoice-items-editor";
import { createInvoiceWithItems } from "@/server/invoices";
import type { Client, Invoice, InvoiceStatus } from "@/lib/schemas";

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  clients,
  defaultClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  clients: Client[];
  defaultClientId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open ? (
          <InvoiceFormBody
            invoice={invoice}
            clients={clients}
            defaultClientId={defaultClientId}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceFormBody({
  invoice,
  clients,
  defaultClientId,
  onClose,
}: {
  invoice?: Invoice;
  clients: Client[];
  defaultClientId?: string;
  onClose: () => void;
}) {
  const isEdit = Boolean(invoice);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [clientId, setClientId] = React.useState<string>(
    invoice?.clientId ?? defaultClientId ?? "",
  );
  const [status, setStatus] = React.useState<InvoiceStatus>(
    invoice?.status ?? "sent",
  );
  const [createdAt, setCreatedAt] = React.useState<string>(
    invoice?.createdAt
      ? toDateInput(invoice.createdAt)
      : toDateInput(new Date()),
  );
  const [paidAt, setPaidAt] = React.useState<string | undefined>(
    invoice?.paidAt ? toDateInput(invoice.paidAt) : undefined,
  );
  const [items, setItems] = React.useState<InvoiceItemRow[]>(
    makeInitialItemRows(),
  );

  const handleSave = async () => {
    if (!clientId) {
      setError("Please select a client");
      return;
    }

    const validItems = items.filter((row) => row.description.trim() !== "");
    if (validItems.length === 0) {
      setError("At least one item with a description is required");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const res = await createInvoiceWithItems({
        clientId,
        status,
        items: validItems.map((row) => ({
          description: row.description,
          quantity: row.quantity,
          price: row.price,
        })),
      });

      if (res.error) {
        setError("Failed to create invoice");
        return;
      }
      onClose();
    } catch {
      setError("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader className="gap-1">
        <DialogTitle>
          {isEdit ? `Edit Invoice #${invoice?.number}` : "New Invoice"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the invoice details and items."
            : "Create a new invoice for one of your clients."}
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Client</FieldLabel>
            <Combobox
              value={clientId}
              onValueChange={(v) => {
                setClientId(v as string);
                setError(null);
              }}
              items={clients.map((c) => ({ value: c.id, label: c.name }))}
              itemToStringLabel={(v) =>
                clients.find((c) => c.id === v)?.name ?? ""
              }
            >
              <ComboboxInput
                placeholder="Select a client"
                showTrigger
                showClear
              />
              <ComboboxContent>
                <ComboboxList>
                  {(item: { value: string; label: string }) => (
                    <ComboboxItem key={item.value} value={item.value}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as InvoiceStatus)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="number">Invoice number</FieldLabel>
              <Input
                id="number"
                type="number"
                defaultValue={invoice?.number ?? ""}
                placeholder="Auto"
                disabled
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Created</FieldLabel>
              <DatePicker
                value={createdAt}
                onChange={(v) => setCreatedAt(v ?? "")}
                placeholder="Pick a date"
              />
            </Field>
            <Field>
              <FieldLabel>Paid</FieldLabel>
              <DatePicker
                value={paidAt}
                onChange={(v) => setPaidAt(v)}
                placeholder="Not paid yet"
              />
            </Field>
          </div>

          <InvoiceItemsEditor value={items} onChange={setItems} />

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Creating..." : isEdit ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </>
  );
}

function toDateInput(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
