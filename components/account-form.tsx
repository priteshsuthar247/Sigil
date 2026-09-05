"use client";

import { useState, useTransition } from "react";
import { updateCurrentUser } from "@/server/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const res = await updateCurrentUser({ name, currentPassword, password });
      if (res.error) {
        const err = res.error as any;
        if (typeof err === "string") {
          toast(err);
        } else if (err?.formErrors) {
          toast(err.formErrors[0] || "Failed to update profile");
        } else {
          const errors: Record<string, string> = {};
          if (err?.fieldErrors?.name) errors.name = err.fieldErrors.name[0];
          if (err?.fieldErrors?.currentPassword) errors.currentPassword = err.fieldErrors.currentPassword[0];
          if (err?.fieldErrors?.password) errors.password = err.fieldErrors.password[0];
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
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="text-base font-medium">{user.name}</div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="text-base">{user.email}</div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Member since</div>
          <div className="text-base">{createdAt}</div>
        </div>
        <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input value={user.email} disabled />
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <p className="text-sm text-red-600">{fieldErrors.name}</p>}
        </Field>
        <Field>
          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
          <PasswordInput id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={password ? "Required to change password" : "Leave blank to keep password"} aria-invalid={!!fieldErrors.currentPassword} />
          {fieldErrors.currentPassword && <p className="text-sm text-red-600">{fieldErrors.currentPassword}</p>}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" aria-invalid={!!fieldErrors.password} />
          {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
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
