"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function AuthControls() {
  return (
    <div className="flex items-center justify-end gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
