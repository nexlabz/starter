"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";
import { Button, buttonVariants } from "@/components/ui/button";
import "./globals.css";

/** Replaces the root layout when it fails, so it brings its own html and body. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <html lang="en" className="h-full antialiased">
      <title>Something went wrong</title>
      <body className="min-h-full flex flex-col">
        <StatusPage code="Error" title="Something went wrong" body="We hit a problem loading this page. Please try again.">
          <Button onClick={() => retry()}>Try again</Button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={buttonVariants({ variant: "outline" })}>Back to home</a>
        </StatusPage>
      </body>
    </html>
  );
}
