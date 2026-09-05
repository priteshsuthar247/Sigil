import { auth } from "@/auth";
import { getCompanyProfile } from "@/server/company";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";

export default async function BusinessProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const profile = await getCompanyProfile(session.user.id);
  return <BusinessProfileForm initialData={profile} />;
}
