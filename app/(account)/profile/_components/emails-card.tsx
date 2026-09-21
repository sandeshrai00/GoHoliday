"use client";

import { useState } from "react";
import { useUser } from "@clerk/react";
import { isReverificationCancelledError } from "@clerk/react/errors";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";
import { useReverifyAction } from "./reverify-action";

export default function EmailsCard() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  // ponytail: Clerk API enforces reverification (10m window) on adding an email;
  // without this wrapper a stale session fails with an opaque 403. Renders OUR
  // dialog (reverify-dialog) instead of Clerk's default modal.
  const { run: addNewEmail, dialog: reverifyDialog } = useReverifyAction(
    async (email: string) => {
      if (!user) throw new Error("Not signed in");
      const created = await user.createEmailAddress({ email });
      await created.prepareVerification({ strategy: "email_code" });
      await user.reload();
      return created.id;
    },
    {
      title: "Verify it's you",
      description: "Confirm your password before adding a new email address.",
    },
  );

  if (!user) return null;

  const pendingEmail = user.emailAddresses.find((a) => a.id === verifyingId);

  const addEmail = async () => {
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      setVerifyingId(await addNewEmail(value));
      setEmail("");
      toast.success("Verification code sent.");
    } catch (err) {
      if (isReverificationCancelledError(err)) return;
      toast.error(errMsg(err, "Could not add email. Please try again."));
    } finally {
      setPending(false);
    }
  };

  const verifyCode = async () => {
    if (!pendingEmail || code.trim().length < 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setPending(true);
    try {
      await pendingEmail.attemptVerification({ code: code.trim() });
      await user.reload();
      setVerifyingId(null);
      setCode("");
      toast.success("Email verified.");
    } catch (err) {
      toast.error(errMsg(err, "Invalid code. Please try again."));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {reverifyDialog}
      <Card>
        <CardHeader>
          <CardTitle>Email addresses</CardTitle>
        <CardDescription>Sign-in emails on your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {user.emailAddresses.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="break-all">{a.emailAddress}</span>
            <span className="flex gap-1.5">
              {a.id === user.primaryEmailAddressId ? <Badge variant="secondary">Primary</Badge> : null}
              {a.verification?.status === "verified" ? (
                <Badge variant="secondary">Verified</Badge>
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
            </span>
          </div>
        ))}

        <Separator />

        {pendingEmail && pendingEmail.verification?.status !== "verified" ? (
          <Alert>
            <AlertDescription>
              Code sent to {pendingEmail.emailAddress}. Enter it below to verify.
            </AlertDescription>
          </Alert>
        ) : null}
        {pendingEmail && pendingEmail.verification?.status !== "verified" ? (
          <div className="grid gap-2">
            <Label htmlFor="email-code">Verification code</Label>
            <div className="flex gap-2">
              <Input
                id="email-code"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button disabled={pending} onClick={verifyCode}>
                {pending ? <Spinner /> : null}
                Verify
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="new-email">Add another email</Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outline" disabled={pending} onClick={addEmail}>
                {pending ? <Spinner /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
