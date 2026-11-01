"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <StatusPage code="Error" title="Something went wrong" body="We hit a problem loading this page. Please try again.">
      <Button onClick={() => retry()}>Try again</Button>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to home</Link>
    </StatusPage>
  );
}
