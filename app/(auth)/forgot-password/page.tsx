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
import { Spinner } from "@/components/ui/spinner";
import AuthCard from "../_components/auth-card";
import OtpInput from "../_components/otp-input";

const emailSchema = z.object({
  emailAddress: z.string().email("Enter a valid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(15, "Password must be at least 15 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

export default function ForgotPasswordPage() {
  const { isLoaded: authLoaded } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const busy = fetchStatus === "fetching" || sending;

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { emailAddress: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!authLoaded) {
    return (
      <AuthCard title="Reset password" description="We'll email you a code">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthCard>
    );
  }

  const sendResetCode = async (): Promise<boolean> => {
    setNotice(null);
    setSending(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
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

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setNotice(null);
    // Identify the account first; the reset code goes to its primary email.
    const { error } = await signIn.create({ identifier: values.emailAddress });
    if (error) {
      setNotice(errMsg(error, "Could not start password reset. Please check the email."));
      return;
    }
    setCode("");
    setCodeError(null);
    if (await sendResetCode()) setStep("code");
  };

  const onVerifyCode = async () => {
    setCodeError(null);
    setNotice(null);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      setCodeError(errMsg(error, "Invalid code. Please try again."));
      return;
    }
    setStep("password");
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setNotice(null);
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: values.password,
    });
    if (error) {
      setNotice(errMsg(error, "Could not set a new password. Please try again."));
      return;
    }
    // Password is set and the sign-in is complete — sign them in.
    try {
      await signIn.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/profile");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
    } catch (e) {
      setNotice(errMsg(e, "Password updated. Please sign in with your new password."));
    }
  };

  return (
    <AuthCard title="Reset password" description="We'll email you a code">
      <div className="grid gap-6">
        {notice && (
          <Alert variant="destructive">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {step === "email" && (
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
                Send reset code
              </Button>
            </form>
          </Form>
        )}

        {step === "code" && (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code we emailed you.
            </p>
            <OtpInput
              id="reset-code"
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
              Verify code
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={sendResetCode}
                disabled={busy}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setCodeError(null);
                }}
                className="text-muted-foreground hover:underline"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === "password" && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="At least 15 characters"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <Spinner /> : null}
                Set new password
              </Button>
            </form>
          </Form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
