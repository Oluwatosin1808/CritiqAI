import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const email = Array.isArray(resolvedSearchParams?.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams?.email;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{email ?? "your email"}</strong>.
            Open your inbox and click the link to verify your account before signing in.
          </p>
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            If you don&apos;t see the email within a few minutes, check your spam folder or resend the verification from the login page.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
            <p className="text-xs text-muted-foreground">
              Once verified, return here or sign in to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
