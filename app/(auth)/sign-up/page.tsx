"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/react";
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
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  emailAddress: z.string().email("Enter a valid email address"),
  password: z.string().min(15, "Password must be at least 15 characters"),
  terms: z.boolean().refine((v) => v, "Please accept the Terms to continue"),
});

const emailCodeSchema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  emailAddress: z.string().email("Enter a valid email address"),
  terms: z.boolean().refine((v) => v, "Please accept the Terms to continue"),
});

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

function TermsCheckbox({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
        />
        <span>
          I agree to the Terms of Service and Privacy Policy.
        </span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function SignUpPage() {
  const { isLoaded: authLoaded } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [verifying, setVerifying] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingName, setPendingName] = useState({ firstName: "", lastName: "" });
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const busy = fetchStatus === "fetching" || sending;

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { firstName: "", lastName: "", emailAddress: "", password: "", terms: false },
  });

  const emailCodeForm = useForm<z.infer<typeof emailCodeSchema>>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: { firstName: "", lastName: "", emailAddress: "", terms: false },
  });

  if (!authLoaded) {
    return (
      <AuthCard title="Create your account" description="Sign up to start booking">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthCard>
    );
  }

  const finalizeToProfile = async () => {
    try {
      await signUp.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/profile");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
    } catch (e) {
      setNotice(errMsg(e, "Could not complete sign up. Please try again."));
    }
  };

  const beginEmailVerification = async (emailAddress: string): Promise<boolean> => {
    setNotice(null);
    setSending(true);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setNotice(errMsg(error, "Could not send a verification code. Please try again."));
        return false;
      }
      setPendingEmail(emailAddress);
      setCode("");
      setCodeError(null);
      setVerifying(true);
      return true;
    } catch (e) {
      setNotice(errMsg(e, "Could not send a verification code. Please try again."));
      return false;
    } finally {
      setSending(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setNotice(null);
    const { error } = await signUp.password({
      emailAddress: values.emailAddress,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });
    if (error) {
      setNotice(errMsg(error, "Sign up failed. Please check your details."));
      return;
    }
    if (signUp.isTransferable) {
      setNotice("An account with this email already exists. Please sign in instead.");
      return;
    }
    if (signUp.status === "complete") {
      await finalizeToProfile();
    } else {
      // Email verification required before the account is active.
      setPendingName({ firstName: values.firstName, lastName: values.lastName });
      await beginEmailVerification(values.emailAddress);
    }
  };

  const onEmailCodeSubmit = async (values: z.infer<typeof emailCodeSchema>) => {
    setNotice(null);
    const { error } = await signUp.create({ emailAddress: values.emailAddress });
    if (error) {
      setNotice(errMsg(error, "Sign up failed. Please check your details."));
      return;
    }
    if (signUp.isTransferable) {
      setNotice("An account with this email already exists. Please sign in instead.");
      return;
    }
    setPendingName({ firstName: values.firstName, lastName: values.lastName });
    await beginEmailVerification(values.emailAddress);
  };

  const onVerifyCode = async () => {
    setCodeError(null);
    setNotice(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setCodeError(errMsg(error, errors?.fields?.code?.message ?? "Invalid code. Please try again."));
      return;
    }
    if (signUp.status === "complete") {
      // Attach the name collected up front (email-code method), then finish.
      if (pendingName.firstName || pendingName.lastName) {
        try {
          await signUp.update({ firstName: pendingName.firstName, lastName: pendingName.lastName });
        } catch {
          // Non-fatal: auth is complete; name can be edited on the profile page.
        }
      }
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

  const nameFields = (form: typeof passwordForm, prefix: "password" | "email") => (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input placeholder="Jane" autoComplete="given-name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last name</FormLabel>
            <FormControl>
              <Input placeholder="Doe" autoComplete="family-name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <AuthCard title="Create your account" description="Sign up to start booking">
      <div className="grid gap-6">
        <GoogleButton mode="sign-up" />

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
              id="signup-code"
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
              Verify and create account
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => beginEmailVerification(pendingEmail)}
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
                  {nameFields(passwordForm, "password")}
                  <FormField
                    control={passwordForm.control}
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
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="At least 15 characters"
                            autoComplete="new-password"
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
                  <FormField
                    control={passwordForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <TermsCheckbox
                          checked={field.value}
                          onChange={field.onChange}
                          error={passwordForm.formState.errors.terms?.message}
                        />
                      </FormItem>
                    )}
                  />
                  <div id="clerk-captcha" />
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? <Spinner /> : null}
                    Create account
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="email-code" className="grid gap-4">
              <Form {...emailCodeForm}>
                <form onSubmit={emailCodeForm.handleSubmit(onEmailCodeSubmit)} className="grid gap-4">
                  {nameFields(emailCodeForm, "email")}
                  <FormField
                    control={emailCodeForm.control}
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
                  <FormField
                    control={emailCodeForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <TermsCheckbox
                          checked={field.value}
                          onChange={field.onChange}
                          error={emailCodeForm.formState.errors.terms?.message}
                        />
                      </FormItem>
                    )}
                  />
                  <div id="clerk-captcha" />
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
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
