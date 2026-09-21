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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errMsg } from "@/lib/clerk-errors";
import { useReverifyAction } from "./_components/reverify-action";
import ChangePasswordForm from "./_components/change-password-form";
import DeleteAccount from "./_components/delete-account";
import EmailsCard from "./_components/emails-card";
import ProfileImageCard from "./_components/profile-image-card";
import SessionsCard from "./_components/sessions-card";

const profileSchema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
});

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  // ponytail: Clerk API enforces reverification (10m window) on connecting an
  // external account; without this wrapper a stale session fails with an opaque 403.
  // Renders OUR dialog (reverify-dialog) instead of Clerk's default modal.
  const { run: linkGoogleAccount, dialog: linkGoogleDialog } = useReverifyAction(
    async () => {
      if (!user) throw new Error("Not signed in");
      await user.createExternalAccount({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/auth/callback`,
      });
    },
    {
      title: "Verify it's you",
      description: "Confirm your password before connecting your Google account.",
    },
  );

  if (!isLoaded) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </main>
    );
  }

  if (!isSignedIn || !user) return null;

  const googleLinked = user.externalAccounts.some(
    (a) => a.provider === "google" || a.providerSlug() === "google",
  );

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await user.update({ firstName: values.firstName, lastName: values.lastName });
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(errMsg(e, "Could not update profile. Please try again."));
    }
  };

  const linkGoogle = async () => {
    try {
      await linkGoogleAccount();
    } catch (e) {
      if (isReverificationCancelledError(e)) return;
      toast.error(errMsg(e, "Could not start Google linking. Please try again."));
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      {linkGoogleDialog}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details and security.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 flex flex-col gap-6">
          <ProfileImageCard />

          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>Update your name. Changes apply immediately.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane" autoComplete="given-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" autoComplete="family-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <Spinner /> : null}
                      Save changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <EmailsCard />

          <Card>
            <CardHeader>
              <CardTitle>Connected accounts</CardTitle>
              <CardDescription>Link a social account for faster sign-in.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {user.externalAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connected accounts.</p>
              ) : (
                user.externalAccounts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{a.providerTitle()}</span>
                    <span className="truncate text-muted-foreground">{a.emailAddress}</span>
                  </div>
                ))
              )}
              {googleLinked ? null : (
                <div>
                  <Button variant="outline" onClick={linkGoogle}>
                    Link Google account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 flex flex-col gap-6">
          <ChangePasswordForm />
          <SessionsCard />
          <DeleteAccount />
        </TabsContent>
      </Tabs>
    </main>
  );
}
