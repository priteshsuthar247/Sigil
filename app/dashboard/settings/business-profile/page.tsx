import { auth } from "@/auth";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { getCompanyProfile } from "@/server/company";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";

export default async function BusinessProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const profile = await getCompanyProfile(session.user.id);
  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings", href: "/dashboard/settings" },
        { label: "Business Profile" }
      ]} />
      <div>
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <p className="text-sm text-muted-foreground">Company details used on invoices</p>
      </div>
      <BusinessProfileForm initialData={profile} />
    </div>
  );
}
