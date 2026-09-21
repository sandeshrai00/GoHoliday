"use client";

import { useUser } from "@clerk/react";
import { isReverificationCancelledError } from "@clerk/react/errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { errMsg } from "@/lib/clerk-errors";
import { useReverifyAction } from "./reverify-action";

const schema = z
  .object({
    newPassword: z.string().min(15, "Password must be at least 15 characters"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .superRefine((v, ctx) => {
    if (v.newPassword !== v.confirm) {
      ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["confirm"] });
    }
  });

export default function ChangePasswordForm() {
  const { user } = useUser();
  const hasPassword = user?.passwordEnabled ?? true;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  // ponytail: Clerk API enforces reverification (10m window) on password set/update;
  // without this wrapper a stale session fails with an opaque 403. Renders OUR
  // dialog (reverify-dialog) instead of Clerk's default modal.
  const { run: updatePassword, dialog: reverifyDialog } = useReverifyAction(
    async (values: { newPassword: string }) => {
      if (!user) throw new Error("Not signed in");
      // ponytail: no current-password field — the modal IS the proof (Clerk PR #5284:
      // asking again after reverification is redundant). Google-only path unchanged.
      return hasPassword
        ? user.updatePassword({
            newPassword: values.newPassword,
            signOutOfOtherSessions: true,
          })
        : user.updatePassword({ newPassword: values.newPassword });
    },
    { title: "Verify it's you", description: "Confirm your password to change it." },
  );

  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      // ponytail: always sign out other sessions on password change (secure default, no checkbox ui)
      await updatePassword({ newPassword: values.newPassword });
      form.reset();
      toast.success(
        hasPassword ? "Password changed. Other devices were signed out." : "Password added.",
      );
    } catch (err) {
      if (isReverificationCancelledError(err)) return;
      toast.error(errMsg(err, "Could not change password. Please try again."));
    }
  };

  return (
    <>
      {reverifyDialog}
      <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Change password" : "Add a password"}</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Use at least 15 characters. Other devices will be signed out. If your session has expired, we'll ask you to verify it's you."
            : "You sign in with Google. Add a password to also sign in with email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 15 characters"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat the new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Spinner /> : null}
                {hasPassword ? "Change password" : "Add password"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      </Card>
    </>
  );
}
