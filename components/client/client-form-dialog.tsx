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
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { clientFormSchema, type Client, type ClientFormValues } from "@/lib/schemas";

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <ClientFormBody
            client={client}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ClientFormBody({
  client,
  onClose,
}: {
  client?: Client;
  onClose: () => void;
}) {
  const isEdit = Boolean(client);

  const [values, setValues] = React.useState<ClientFormValues>({
    name: client?.name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ClientFormValues, string>>
  >({});

  const update = <K extends keyof ClientFormValues>(
    key: K,
    value: ClientFormValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = () => {
    const result = clientFormSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        phone: flat.phone?.[0],
        address: flat.address?.[0],
      });
      return;
    }
    onClose();
  };

  return (
    <>
      <DialogHeader className="gap-1">
        <DialogTitle>{isEdit ? "Edit Client" : "New Client"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the client details."
            : "Add a new client to send invoices to."}
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
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="client-name">Name</FieldLabel>
            <Input
              id="client-name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
              placeholder="Acme Co."
            />
            {errors.name ? <FieldError>{errors.name}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="client-email">Email</FieldLabel>
            <Input
              id="client-email"
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              placeholder="billing@acme.test"
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="client-phone">Phone</FieldLabel>
            <Input
              id="client-phone"
              value={values.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              placeholder="+1 415 555 0101"
            />
            {errors.phone ? <FieldError>{errors.phone}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(errors.address)}>
            <FieldLabel htmlFor="client-address">Address</FieldLabel>
            <Textarea
              id="client-address"
              value={values.address ?? ""}
              onChange={(e) => update("address", e.target.value)}
              aria-invalid={Boolean(errors.address)}
              placeholder="100 Market St, San Francisco, CA"
            />
            {errors.address ? (
              <FieldError>{errors.address}</FieldError>
            ) : null}
          </Field>
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
