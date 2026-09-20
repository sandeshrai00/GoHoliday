import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
          G
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{SITE_NAME}</h1>
        <p className="mt-3 max-w-md text-lg text-muted-foreground">{SITE_TAGLINE}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Create account</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
