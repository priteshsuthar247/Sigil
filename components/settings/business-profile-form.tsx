"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Input id="companyAddress" {...register("companyAddress")} />
            {errors.companyAddress && <p className="text-sm text-destructive">{errors.companyAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input id="companyEmail" type="email" {...register("companyEmail")} />
            {errors.companyEmail && <p className="text-sm text-destructive">{errors.companyEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Phone</Label>
            <Input id="companyPhone" {...register("companyPhone")} />
            {errors.companyPhone && <p className="text-sm text-destructive">{errors.companyPhone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input id="paymentTerms" {...register("paymentTerms")} />
            {errors.paymentTerms && <p className="text-sm text-destructive">{errors.paymentTerms.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" {...register("gstin")} />
            {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <PasswordInput id="currentPassword" {...register("currentPassword")} />
            {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
