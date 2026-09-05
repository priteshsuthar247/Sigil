"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertCompanyProfileAction } from "@/app/dashboard/settings/business-profile/actions";

const Schema = z.object({
  companyName: z.string().min(1, "Required"),
  companyAddress: z.string().min(1, "Required"),
  companyEmail: z.string().email("Invalid email"),
  companyPhone: z.string().min(1, "Required"),
  paymentTerms: z.string().min(1, "Required"),
  gstin: z.string().min(1, "Required"),
  notes: z.string().min(1, "Required"),
  currentPassword: z.string().min(1, "Current password required"),
});

type FormData = z.infer<typeof Schema>;

export function BusinessProfileForm({ initialData }: { initialData: any }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      companyAddress: initialData?.companyAddress || "",
      companyEmail: initialData?.companyEmail || "",
      companyPhone: initialData?.companyPhone || "",
      paymentTerms: initialData?.paymentTerms || "",
      gstin: initialData?.gstin || "",
      notes: initialData?.notes || "",
      currentPassword: "",
    }
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await upsertCompanyProfileAction(data);
      } catch (e: any) {
        setError(e.message || "Failed to save");
      }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Update company details used on invoices. Password is required to save changes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.companyName}>
              <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && <FieldError>{errors.companyName.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.companyAddress}>
              <FieldLabel htmlFor="companyAddress">Address</FieldLabel>
              <Input id="companyAddress" {...register("companyAddress")} />
              {errors.companyAddress && <FieldError>{errors.companyAddress.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.companyEmail}>
              <FieldLabel htmlFor="companyEmail">Email</FieldLabel>
              <Input id="companyEmail" type="email" {...register("companyEmail")} />
              {errors.companyEmail && <FieldError>{errors.companyEmail.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.companyPhone}>
              <FieldLabel htmlFor="companyPhone">Phone</FieldLabel>
              <Input id="companyPhone" {...register("companyPhone")} />
              {errors.companyPhone && <FieldError>{errors.companyPhone.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.paymentTerms}>
              <FieldLabel htmlFor="paymentTerms">Payment Terms</FieldLabel>
              <Input id="paymentTerms" {...register("paymentTerms")} />
              {errors.paymentTerms && <FieldError>{errors.paymentTerms.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.gstin}>
              <FieldLabel htmlFor="gstin">GSTIN</FieldLabel>
              <Input id="gstin" {...register("gstin")} />
              {errors.gstin && <FieldError>{errors.gstin.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" {...register("notes")} />
              {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
              <PasswordInput id="currentPassword" {...register("currentPassword")} />
              {errors.currentPassword && <FieldError>{errors.currentPassword.message}</FieldError>}
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
