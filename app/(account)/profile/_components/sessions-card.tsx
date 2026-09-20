"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/react";
import { Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";

interface DeviceSession {
  id: string;
  lastActiveAt: Date;
  latestActivity?: {
    browserName?: string;
    browserVersion?: string;
    deviceType?: string;
    city?: string;
    country?: string;
    isMobile?: boolean;
  };
  revoke: () => Promise<unknown>;
}

// ponytail: coarse buckets, pull in date-fns only if precision matters
function timeAgo(d: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function SessionsCard() {
  const { user } = useUser();
  const { session } = useSession();
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    user
      ?.getSessions()
      .then((list) => {
        if (alive) setSessions(list);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) return null;
  const currentId = session?.id;

  const revokeOne = async (id: string) => {
    const target = sessions?.find((s) => s.id === id);
    if (!target) return;
    setRevoking(id);
    try {
      await target.revoke();
      setSessions((prev) => (prev ?? []).filter((s) => s.id !== id));
      toast.success("Device signed out.");
    } catch (err) {
      toast.error(errMsg(err, "Could not sign out that device."));
    } finally {
      setRevoking(null);
    }
  };

  const revokeOthers = async () => {
    const others = (sessions ?? []).filter((s) => s.id !== currentId);
    if (others.length === 0) return;
    setRevoking("others");
    try {
      await Promise.all(others.map((s) => s.revoke()));
      setSessions((prev) => (prev ?? []).filter((s) => s.id === currentId));
      toast.success("All other devices signed out.");
    } catch (err) {
      toast.error(errMsg(err, "Could not sign out other devices."));
    } finally {
      setRevoking(null);
    }
  };

  const othersCount = (sessions ?? []).filter((s) => s.id !== currentId).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signed-in devices</CardTitle>
        <CardDescription>Every device currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {loadError ? (
          <Alert>
            <AlertDescription>Could not load devices. Reload the page to try again.</AlertDescription>
          </Alert>
        ) : sessions === null ? (
          <div className="grid gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active devices.</p>
        ) : (
          sessions.map((s) => {
            const a = s.latestActivity;
            const isCurrent = s.id === currentId;
            const browser = [a?.browserName, a?.browserVersion].filter(Boolean).join(" ");
            const place = [a?.city, a?.country].filter(Boolean).join(", ");
            const Icon = a?.isMobile ? Smartphone : Monitor;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm"
              >
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <div className="flex flex-wrap items-center gap-1.5 font-medium">
                    <span className="truncate">{browser || "Unknown browser"}</span>
                    {isCurrent ? <Badge variant="secondary">This device</Badge> : null}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {[a?.deviceType, place].filter(Boolean).join(" · ") || "Unknown location"} ·{" "}
                    {timeAgo(s.lastActiveAt)}
                  </span>
                </div>
                {isCurrent ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={revoking !== null}
                    onClick={() => revokeOne(s.id)}
                  >
                    {revoking === s.id ? <Spinner /> : null}
                    Revoke
                  </Button>
                )}
              </div>
            );
          })
        )}
        {othersCount > 0 ? (
          <div>
            <Button variant="outline" disabled={revoking !== null} onClick={revokeOthers}>
              {revoking === "others" ? <Spinner /> : null}
              Sign out all other devices
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
