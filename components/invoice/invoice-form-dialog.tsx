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
import type { Client, Invoice, InvoiceStatus } from "@/lib/schemas";

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  clients: Client[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open ? (
          <InvoiceFormBody
            invoice={invoice}
            clients={clients}
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
  onClose,
}: {
  invoice?: Invoice;
  clients: Client[];
  onClose: () => void;
}) {
  const isEdit = Boolean(invoice);

  const [clientId, setClientId] = React.useState<string>(
    invoice?.clientId ?? "",
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

  const handleSave = () => {
    onClose();
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
              onValueChange={(v) => setClientId(v as string)}
              items={clients}
            >
              <ComboboxInput
                placeholder="Select a client"
                showTrigger
                showClear
              />
              <ComboboxContent>
                <ComboboxList>
                  {(client: Client) => (
                    <ComboboxItem key={client.id} value={client.id}>
                      {client.name}
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
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button onClick={handleSave}>
          {isEdit ? "Save changes" : "Create"}
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
