import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AcceptInvitation } from "@/components/team-actions";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Accept invitation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AcceptInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(`/accept-invitation/${id}`)}`);
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-24">
      <h1 className="text-2xl font-bold">You&apos;ve been invited</h1>
      <p className="mt-2 text-sm text-muted">Signed in as {session.user.email}. Accept to join the workspace.</p>
      <AcceptInvitation id={id} />
    </main>
  );
}
