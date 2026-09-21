"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

const FOCUSABLE =
  'input, button:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Production dialog shell: Escape-to-close, backdrop-press close, body scroll
 * lock, focus-in on open, focus restore on close, and Tab trapped inside.
 *
 * Dismiss always routes through onDismiss — the caller owns the semantics:
 * reverify passes onCancel (fail-closed: the original action never retries),
 * delete-confirm just closes. Dismiss is ignored while `locked` (a verification
 * attempt in flight), matching the disabled Cancel button.
 */
export function useDialogShell(onDismiss: () => void, locked: boolean, open = true) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const card = cardRef.current;
    card?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onDismiss();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const items = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onBackdropPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // ponytail: pointerdown (not click) + target check — a drag-select starting on
    // the backdrop can't close it, and presses starting inside the card never match.
    if (!lockedRef.current && e.target === e.currentTarget) onDismiss();
  };

  return { cardRef, onBackdropPointerDown };
}
