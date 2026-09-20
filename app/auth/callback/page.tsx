"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/profile");
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Completing sign in</CardTitle>
          <CardDescription>Please wait while we finish signing you in.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {isLoaded && !isSignedIn ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sign-in did not complete. Please try again.
              </p>
              <Button asChild>
                <Link href="/sign-in">Back to sign in</Link>
              </Button>
            </>
          ) : (
            <Spinner />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
