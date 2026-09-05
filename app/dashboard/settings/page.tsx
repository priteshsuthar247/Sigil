import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-4">
        <Link href="/dashboard/settings/business-profile" className="block rounded-md border p-4 hover:bg-accent">
          <p className="font-medium">Business Profile</p>
          <p className="text-sm text-muted-foreground">Manage company name, address, email, phone, payment terms, GSTIN and notes used in invoices</p>
        </Link>
      </div>
    </div>
  );
}
