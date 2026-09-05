import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountForm } from "@/components/account-form";
import { getCurrentUser } from "@/server/users";

export default async function AccountPage() {
  const result = await getCurrentUser();
  if (result.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p>Unauthorized</p>
      </div>
    );
  }
  const user = result.data!;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and update your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
