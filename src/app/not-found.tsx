import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage code="404" title="Page not found" body="The page you're looking for doesn't exist or has moved.">
      <Link href="/" className={buttonVariants()}>Back to home</Link>
    </StatusPage>
  );
}
