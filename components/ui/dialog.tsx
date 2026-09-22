"use client";

import type { ReactNode } from "react";
import { useDialogShell } from "./use-dialog-shell";

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

/** Shared modal built on the proven dialog shell (Escape/backdrop/focus-trap/scroll-lock). */
export default function Dialog({
  title,
  onClose,
  locked = false,
  size = "md",
  children,
}: {
  title: string;
  onClose: () => void;
  locked?: boolean;
  size?: keyof typeof SIZES;
  children: ReactNode;
}) {
  const { cardRef, onBackdropPointerDown } = useDialogShell(onClose, locked);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onPointerDown={onBackdropPointerDown}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full ${SIZES[size]} overflow-y-auto rounded-xl bg-background p-6 shadow-xl`}
      >
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
