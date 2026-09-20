"use client";

import { useUser } from "@clerk/react";
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

const schema = z
  .object({
    currentPassword: z.string(),
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
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (hasPassword && !values.currentPassword) {
      form.setError("currentPassword", { message: "Enter your current password" });
      return;
    }
    try {
      // ponytail: always sign out other sessions on password change (secure default, no checkbox ui)
      await user.updatePassword(
        hasPassword
          ? {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
              signOutOfOtherSessions: true,
            }
          : { newPassword: values.newPassword },
      );
      form.reset();
      toast.success(
        hasPassword ? "Password changed. Other devices were signed out." : "Password added.",
      );
    } catch (err) {
      toast.error(errMsg(err, "Could not change password. Please try again."));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Change password" : "Add a password"}</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Use at least 15 characters. Other devices will be signed out."
            : "You sign in with Google. Add a password to also sign in with email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {hasPassword ? (
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="•••••••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
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
  );
}
