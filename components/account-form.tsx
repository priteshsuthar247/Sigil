"use client";

import { useState, useTransition, useMemo } from "react";
import { updateCurrentUser, type UpdateUserResult } from "@/server/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export function AccountForm({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordChecks = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return { hasMinLength, hasLower, hasUpper, hasDigit, isValid: hasMinLength && hasLower && hasUpper && hasDigit };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const res = await updateCurrentUser({ name, currentPassword, password });
      if ('error' in res) {
        if (typeof res.error === "string") {
          toast(res.error);
        } else if (res.error.formErrors?.length) {
          toast(res.error.formErrors[0] || "Failed to update profile");
        } else {
          const errors: Record<string, string> = {};
          const fieldErrors = res.error.fieldErrors;
          if (fieldErrors?.name) errors.name = fieldErrors.name[0];
          if (fieldErrors?.currentPassword) errors.currentPassword = fieldErrors.currentPassword[0];
          if (fieldErrors?.password) errors.password = fieldErrors.password[0];
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            toast("Failed to update profile");
          }
        }
      } else {
        toast("Profile updated");
        setIsEditing(false);
        setCurrentPassword("");
        setPassword("");
        setFieldErrors({});
      }
    });
  };

  const createdAt = new Date(user.createdAt).toLocaleDateString();

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-base font-medium">{user.name}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-base">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="text-base">{createdAt}</dd>
          </div>
        </dl>
        <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={user.email} disabled />
        </Field>
        <Field data-invalid={!!fieldErrors.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
        </Field>
        <Field data-invalid={!!fieldErrors.currentPassword}>
          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
          <PasswordInput id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={password ? "Required to change password" : "Leave blank to keep password"} aria-invalid={!!fieldErrors.currentPassword} />
          {fieldErrors.currentPassword && <FieldError>{fieldErrors.currentPassword}</FieldError>}
        </Field>
        <Field data-invalid={!!fieldErrors.password}>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" aria-invalid={!!fieldErrors.password} aria-describedby="password-help" />
          {password && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground" id="password-help">
              <div className="flex items-center gap-1.5">
                {passwordChecks.hasMinLength ? <CheckIcon className="size-3.5 text-green-600" /> : <XIcon className="size-3.5 text-red-600" />}
                Minimum 8 characters
              </div>
              <div className="flex items-center gap-1.5">
                {passwordChecks.hasLower ? <CheckIcon className="size-3.5 text-green-600" /> : <XIcon className="size-3.5 text-red-600" />}
                Contains lowercase letter
              </div>
              <div className="flex items-center gap-1.5">
                {passwordChecks.hasUpper ? <CheckIcon className="size-3.5 text-green-600" /> : <XIcon className="size-3.5 text-red-600" />}
                Contains uppercase letter
              </div>
              <div className="flex items-center gap-1.5">
                {passwordChecks.hasDigit ? <CheckIcon className="size-3.5 text-green-600" /> : <XIcon className="size-3.5 text-red-600" />}
                Contains number
              </div>
            </div>
          )}
          {!password && (
            <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep current password. If set, must meet requirements above.</p>
          )}
          {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
        </Field>
        <Field className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setName(user.name); setCurrentPassword(""); setPassword(""); }}>
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
