import Link from "next/link";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" }
      ]} />
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and business preferences</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/settings/business-profile">
          <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <SettingsIcon className="size-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Business Profile</CardTitle>
                <CardDescription>Company details used on invoices</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage company name, address, email, phone, payment terms, GSTIN and notes used in invoices</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
