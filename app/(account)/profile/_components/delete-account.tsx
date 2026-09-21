"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/react";
import { isReverificationCancelledError } from "@clerk/react/errors";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";
import { useDialogShell } from "./use-dialog-shell";
import { useReverifyAction } from "./reverify-action";

export default function DeleteAccount() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  // Dismiss (backdrop press / Escape) only closes — deletion needs the explicit
  // Yes button. Overlay is already gone before deletion runs, so busy never locks it.
  const { cardRef, onBackdropPointerDown } = useDialogShell(
    () => setConfirming(false),
    busy,
    confirming,
  );

  // ponytail: Clerk API enforces reverification (10m window) on account deletion;
  // without this wrapper a stale session fails with an opaque 403. Renders OUR
  // dialog (reverify-dialog) instead of Clerk's default modal.
  const { run: deleteMyAccount, dialog: reverifyDialog } = useReverifyAction(
    async () => {
      if (!user) throw new Error("Not signed in");
      await user.delete();
    },
    {
      title: "Delete your account?",
      description: "Verify to permanently delete your account. This cannot be undone.",
    },
  );

  if (!user) return null;
  if (!user.deleteSelfEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>Account deletion is disabled for this account.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const onDelete = async () => {
    if (busy) return;
    setConfirming(false);
    setBusy(true);
    try {
      await deleteMyAccount();
      await signOut();
      router.push("/");
    } catch (err) {
      if (!isReverificationCancelledError(err)) {
        toast.error(errMsg(err, "Could not delete account. Please try again."));
      }
      setBusy(false);
    }
  };

  return (
    <>
      {reverifyDialog}
      <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your account and signs you out everywhere. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div>
          <Button variant="destructive" disabled={busy} onClick={() => setConfirming(true)}>
            {busy ? <Spinner /> : null}
            Delete account
          </Button>
        </div>
      </CardContent>
    </Card>
    {confirming ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        onPointerDown={onBackdropPointerDown}
      >
        <div
          ref={cardRef}
          className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
        >
          <h2 id="delete-title" className="text-lg font-semibold text-destructive">
            Delete your account?
          </h2>
          <p id="delete-description" className="mt-1 text-sm text-muted-foreground">
            This permanently deletes your account and signs you out everywhere. This cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              No, keep my account
            </Button>
            <Button variant="destructive" onClick={() => void onDelete()} disabled={busy}>
              {busy ? <Spinner /> : null}
              Yes, delete it
            </Button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
