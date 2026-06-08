import { Suspense } from "react";
import { LoginFormWrapper } from "./login-form-wrapper";

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <LoginFormWrapper />
      </Suspense>
    </div>
  );
}
