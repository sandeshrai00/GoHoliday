"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function messageOf(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Could not start Google sign-in. Please try again.";
}

export default function GoogleButton({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: err } =
        mode === "sign-in"
          ? await signIn.sso({
              strategy: "oauth_google",
              redirectUrl: "/profile",
              redirectCallbackUrl: "/auth/callback",
            })
          : await signUp.sso({
              strategy: "oauth_google",
              redirectUrl: "/profile",
              redirectCallbackUrl: "/auth/callback",
            });
      // Success navigates away to Google, so reaching here means it failed.
      if (err) setError(messageOf(err));
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Button variant="outline" onClick={handleClick} disabled={loading} className="w-full">
        {loading ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
