import Link from "next/link";
import { DotField } from "@/components/dot-field";
import { Mark } from "@/components/mark";
import { site } from "@/config/site";

/** Two-panel frame for sign-in, sign-up, onboarding and invitations. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen flex-1 gap-2 p-2 lg:grid-cols-2">
      <main className="flex flex-col px-5 py-5 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2 self-start font-semibold"><Mark />{site.name}</Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </main>
      <aside className="bg-wash relative hidden overflow-hidden rounded-[28px] lg:block">
        <DotField />
      </aside>
    </div>
  );
}
