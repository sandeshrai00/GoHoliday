"use client";

import { useState, type ReactNode } from "react";
import { useReverification } from "@clerk/react";
import ReverifyDialog, { type ReverifyLevel } from "./reverify-dialog";

interface PendingReverify {
  complete: () => void;
  cancel: () => void;
  level: ReverifyLevel | undefined;
}

/**
 * Wraps a sensitive action with Clerk's reverification, but renders OUR dialog
 * instead of Clerk's default modal. `complete()` auto-retries the action,
 * `cancel()` rejects it (existing isReverificationCancelledError handling stays silent).
 */
export function useReverifyAction<Args extends unknown[], Result>(
  fetcher: (...args: Args) => Promise<Result>,
  copy: { title: string; description: string },
) {
  const [pending, setPending] = useState<PendingReverify | null>(null);
  const run = useReverification(fetcher, {
    onNeedsReverification: ({ complete, cancel, level }) =>
      setPending({ complete, cancel, level: level as ReverifyLevel | undefined }),
  });
  const dialog: ReactNode = pending ? (
    <ReverifyDialog
      title={copy.title}
      description={copy.description}
      level={pending.level}
      onComplete={() => {
        pending.complete();
        setPending(null);
      }}
      onCancel={() => {
        pending.cancel();
        setPending(null);
      }}
    />
  ) : null;
  return { run, dialog };
}
