"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthCard from "../_components/auth-card";
import GoogleButton from "../_components/google-button";
import OtpInput from "../_components/otp-input";

const passwordSchema = z.object({
  identifier: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const emailSchema = z.object({
  emailAddress: z.string().email("Enter a valid email address"),
});

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

export default function SignInPage() {
  const { isLoaded: authLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [verifying, setVerifying] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const busy = fetchStatus === "fetching" || sending;

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { emailAddress: "" },
  });

  if (!authLoaded) {
    return (
      <AuthCard title="Welcome back" description="Sign in to your account">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthCard>
    );
  }

  const finalizeToProfile = async () => {
    try {
      await signIn.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/profile");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
    } catch (e) {
      setNotice(errMsg(e, "Could not complete sign in. Please try again."));
    }
  };

  const sendCode = async (emailAddress: string): Promise<boolean> => {
    setNotice(null);
    setSending(true);
    try {
      const { error } = await signIn.emailCode.sendCode({ emailAddress });
      if (error) {
        setNotice(errMsg(error, "Could not send a code. Please try again."));
        return false;
      }
      return true;
    } catch (e) {
      setNotice(errMsg(e, "Could not send a code. Please try again."));
      return false;
    } finally {
      setSending(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setNotice(null);
    const { error } = await signIn.password({
      identifier: values.identifier,
      password: values.password,
    });
    if (error) {
      setNotice(errMsg(error, "Sign in failed. Please check your details."));
      return;
    }
    if (signIn.status === "complete") {
      await finalizeToProfile();
    } else {
      // Extra verification required (e.g. new device) → email-code step.
      setPendingEmail(values.identifier);
      setCode("");
      setCodeError(null);
      if (await sendCode(values.identifier)) setVerifying(true);
    }
  };

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setNotice(null);
    setPendingEmail(values.emailAddress);
    setCode("");
    setCodeError(null);
    if (await sendCode(values.emailAddress)) setVerifying(true);
  };

  const onVerifyCode = async () => {
    setCodeError(null);
    setNotice(null);
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error) {
      setCodeError(errMsg(error, errors?.fields?.code?.message ?? "Invalid code. Please try again."));
      return;
    }
    if (signIn.status === "complete") {
      await finalizeToProfile();
    } else {
      setCodeError("Verification did not complete. Please try again.");
    }
  };

  const resetVerify = () => {
    setVerifying(false);
    setCode("");
    setCodeError(null);
  };

  return (
    <AuthCard title="Welcome back" description="Sign in to your account">
      <div className="grid gap-6">
        <GoogleButton mode="sign-in" />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>or continue with</span>
          <Separator className="flex-1" />
        </div>

        {notice && (
          <Alert variant="destructive">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {verifying ? (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>.
            </p>
            <OtpInput
              id="signin-code"
              value={code}
              onChange={(v) => {
                setCode(v);
                setCodeError(null);
              }}
              error={codeError}
              disabled={busy}
            />
            <Button onClick={onVerifyCode} disabled={busy || code.length < 6} className="w-full">
              {busy ? <Spinner /> : null}
              Verify and sign in
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => pendingEmail && sendCode(pendingEmail)}
                disabled={busy || !pendingEmail}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
              <button type="button" onClick={resetVerify} className="text-muted-foreground hover:underline">
                Back
              </button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="password" onValueChange={resetVerify} className="grid gap-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="email-code">Email code</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="grid gap-4">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4">
                  <FormField
                    control={passwordForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                        {errors?.fields?.identifier?.message && (
                          <p className="text-sm text-destructive">{errors.fields.identifier.message}</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="•••••••••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {errors?.fields?.password?.message && (
                          <p className="text-sm text-destructive">{errors.fields.password.message}</p>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? <Spinner /> : null}
                    Sign in
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="email-code" className="grid gap-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="grid gap-4">
                  <FormField
                    control={emailForm.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? <Spinner /> : null}
                    Send code
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
