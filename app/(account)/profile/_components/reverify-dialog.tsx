"use client";

import { useEffect, useState } from "react";
import { useSession } from "@clerk/react";
import OtpInput from "@/app/(auth)/_components/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";
import { useResendCooldown } from "@/lib/use-resend-cooldown";
import { useDialogShell } from "./use-dialog-shell";

export type ReverifyLevel = "first_factor" | "second_factor" | "multi_factor";

// ponytail: minimal local shapes — the installed @clerk/react doesn't re-export
// these types, but the session method calls below are still fully type-checked.
type FirstFactor = { strategy: string; emailAddressId?: string; safeIdentifier?: string };

/**
 * Our own UI for Clerk's reverification: Clerk owns the verification logic
 * (start/prepare/attempt on the session), this component only renders the screens.
 * Password when the account has one (strongest available), otherwise email code.
 */
export default function ReverifyDialog({
  title,
  description,
  level,
  onComplete,
  onCancel,
}: {
  title: string;
  description: string;
  level?: ReverifyLevel;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { session } = useSession();
  const [phase, setPhase] = useState<"starting" | "password" | "code" | "unsupported">("starting");
  const [safeIdentifier, setSafeIdentifier] = useState("");
  const [emailAddressId, setEmailAddressId] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { cooldown, start } = useResendCooldown();
  // Dismiss (backdrop press / Escape) = onCancel: fail-closed, the original
  // action is rejected and never retried. Ignored while an attempt is in flight.
  const { cardRef, onBackdropPointerDown } = useDialogShell(onCancel, busy);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!session) throw new Error("Not signed in");
        const resource = await session.startVerification({ level: level ?? "first_factor" });
        if (!alive) return;
        if (resource.status === "complete") {
          onComplete();
          return;
        }
        const factors = (resource.supportedFirstFactors ?? []) as FirstFactor[];
        if (factors.some((f) => f.strategy === "password")) {
          setPhase("password");
          return;
        }
        const emailFactor = factors.find(
          (f) => f.strategy === "email_code" && f.emailAddressId && f.safeIdentifier,
        );
        if (emailFactor?.emailAddressId) {
          // ponytail: prepare SENDS the code. Password skips prepare entirely —
          // the SDK's prepare params don't accept the password strategy.
          await session.prepareFirstFactorVerification({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          if (!alive) return;
          setEmailAddressId(emailFactor.emailAddressId);
          setSafeIdentifier(emailFactor.safeIdentifier ?? "");
          setPhase("code");
          start();
          return;
        }
        setPhase("unsupported");
      } catch (err) {
        if (alive) setError(errMsg(err, "Could not start verification. Please try again."));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPassword = async () => {
    if (!session) return;
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await session.attemptFirstFactorVerification({ strategy: "password", password });
      onComplete();
    } catch (err) {
      setError(errMsg(err, "Incorrect password. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!session) return;
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await session.attemptFirstFactorVerification({ strategy: "email_code", code: code.trim() });
      onComplete();
    } catch (err) {
      setError(errMsg(err, "Invalid code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!session || !emailAddressId || cooldown > 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId,
      });
      start();
      setNotice("A new code was sent.");
    } catch (err) {
      setError(errMsg(err, "Could not resend the code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reverify-title"
      aria-describedby="reverify-description"
      onPointerDown={onBackdropPointerDown}
    >
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
      >
        <h2 id="reverify-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p id="reverify-description" className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mt-4">
          {phase === "password" ? (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void verifyPassword();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="reverify-password">Password</Label>
                <Input
                  id="reverify-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="•••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? <Spinner /> : null}
                  Verify
                </Button>
              </div>
            </form>
          ) : phase === "code" ? (
            <div className="grid gap-3">
              <p className="text-sm">
                We sent a 6-digit code to <span className="font-medium">{safeIdentifier}</span>.
              </p>
              <OtpInput
                id="reverify-code"
                value={code}
                onChange={(v) => setCode(v)}
                error={error}
                disabled={busy}
              />
              {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => void resend()}
                  disabled={busy || cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => void verifyCode()} disabled={busy}>
                    {busy ? <Spinner /> : null}
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="grid gap-3">
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : phase === "unsupported" ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                This action needs two-step verification, which isn&rsquo;t set up on your account
                yet.
              </p>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Preparing verification…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
