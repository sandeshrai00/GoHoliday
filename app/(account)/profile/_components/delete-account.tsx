"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";

export default function DeleteAccount() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

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

  const ready = confirm.trim() === "DELETE";

  const onDelete = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await user.delete();
      await signOut();
      router.push("/");
    } catch (err) {
      toast.error(errMsg(err, "Could not delete account. Please try again."));
      setBusy(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your account and signs you out everywhere. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
          <div className="flex gap-2">
            <Input
              id="delete-confirm"
              placeholder="DELETE"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button variant="destructive" disabled={!ready || busy} onClick={onDelete}>
              {busy ? <Spinner /> : null}
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
