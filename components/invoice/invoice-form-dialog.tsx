"use client";

import { useState, useMemo } from "react";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
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
import { createInvoiceWithItems, updateInvoiceWithItems } from "@/server/invoices";
import type { Client, Invoice, InvoiceStatus } from "@/lib/schemas";
import { toast } from "sonner";

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  items,
  clients,
  defaultClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  items?: { description: string; quantity: number; price: number }[];
  clients: Client[];
  defaultClientId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open ? (
          <InvoiceFormBody
            invoice={invoice}
            items={items}
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
  items,
  clients,
  defaultClientId,
  onClose,
}: {
  invoice?: Invoice;
  items?: { description: string; quantity: number; price: number }[];
  clients: Client[];
  defaultClientId?: string;
  onClose: () => void;
}) {
  const isEdit = Boolean(invoice);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState<string>(
    invoice?.clientId ?? defaultClientId ?? "",
  );
  const clientItems = useMemo(() => {
    return clients;
  }, [clients]);
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === clientId) ?? null;
  }, [clients, clientId]);
  const [status, setStatus] = useState<InvoiceStatus>(
    invoice?.status ?? "sent",
  );
  const [itemRows, setItemRows] = useState<InvoiceItemRow[]>(() => {
    if (isEdit && items && items.length > 0) {
      return items.map((i, idx) => ({
        id: `edit-${idx}-${Math.random().toString(36).slice(2)}`,
        description: i.description,
        quantity: i.quantity,
        price: i.price,
      }));
    }
    return makeInitialItemRows();
  });

  const handleSave = async () => {
    if (!clientId) {
      setError("Please select a client");
      return;
    }

    const validItems = itemRows.filter((row) => row.description.trim() !== "");
    if (validItems.length === 0) {
      setError("At least one item with a description is required");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (isEdit && invoice) {
        const res = await updateInvoiceWithItems(invoice.id, {
          clientId,
          status,
          items: validItems.map((row) => ({
            description: row.description,
            quantity: row.quantity,
            price: row.price,
          })),
        });
        if (res.error) {
          setError(Array.isArray(res.error) ? res.error[0]?.message : "Failed to update invoice");
          return;
        }
        toast.success(`Invoice #${invoice.number} updated`);
      } else {
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
        toast.success("Invoice created");
      }
      onClose();
    } catch {
      setError(isEdit ? "Failed to update invoice" : "Failed to create invoice");
      toast.error(isEdit ? "Failed to update invoice" : "Failed to create invoice");
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
              value={selectedClient}
              onValueChange={(v) => {
                setClientId((v as Client)?.id ?? "");
                setError(null);
              }}
              items={clientItems}
              itemToStringLabel={(item) => (item as Client)?.name ?? ""}
            >
              <ComboboxInput
                autoFocus={!isEdit}
                placeholder="Select a client"
                showTrigger
                showClear
                disabled={isEdit || saving}
              />
              <ComboboxContent>
                <ComboboxList>
                  {(item: Client) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel id="mark-as-paid-label">Mark as paid</FieldLabel>
              <div className="flex items-center gap-2">
                <Switch
                  checked={status === "paid"}
                  onCheckedChange={(checked) => setStatus(checked ? "paid" : "sent")}
                  disabled={saving}
                  aria-labelledby="mark-as-paid-label"
                />
                <span className="text-sm text-muted-foreground">
                  {status === "paid" ? "Paid" : "Sent"}
                </span>
              </div>
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

          <InvoiceItemsEditor value={itemRows} onChange={setItemRows} />

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </>
  );
}
