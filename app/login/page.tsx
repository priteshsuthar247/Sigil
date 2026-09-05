import { Suspense } from "react";
import { LoginForm } from "@/components/login-form"

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
