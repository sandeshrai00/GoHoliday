"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useUser } from "@clerk/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";
import { userRole } from "@/lib/roles";

export default function ProfileImageCard() {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Account";
  const initials =
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "A";

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setBusy(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(errMsg(err, "Could not update photo. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      toast.success("Profile photo removed.");
    } catch (err) {
      toast.error(errMsg(err, "Could not remove photo. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile photo</CardTitle>
        <CardDescription>Shown across GoHoliday.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.imageUrl} alt={name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{name}</span>
              {userRole(user) === "admin" ? <Badge>Admin</Badge> : null}
            </div>
            <div className="flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Spinner /> : null}
              Upload photo
            </Button>
            {user.hasImage ? (
              <Button variant="ghost" disabled={busy} onClick={onRemove}>
                Remove
              </Button>
            ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
