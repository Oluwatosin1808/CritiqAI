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
        <CardContent>
          <p className="mb-4">
            We sent a confirmation link to <strong>{email ?? "your email"}</strong>.
            Please check your inbox and click the link to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            After verifying, return to the <Link href="/login">sign in</Link> page to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
