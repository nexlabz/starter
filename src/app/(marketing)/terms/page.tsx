import type { Metadata } from "next";
import { PageIntro, Prose } from "@/components/marketing";
import { site } from "@/config/site";

// Template wording. Stays out of search until it's been reviewed for your product.
export const metadata: Metadata = {
  title: "Terms",
  description: `The terms for using ${site.name}.`,
  robots: { index: false, follow: true },
};

const sections = [
  { title: "Your account", body: "Keep your sign-in details safe. You're responsible for what happens in your account and in the workspaces you own." },
  { title: "Your data", body: "What you put in your workspace stays yours. We only use it to run the service for you." },
  { title: "Paid plans", body: "Plans are billed per workspace through Polar. Subscriptions renew until you cancel, and cancelling keeps your plan until the end of the paid period." },
  { title: "Acceptable use", body: "Don't use the service to break the law, attack other systems, or get around plan limits." },
  { title: "Closing an account", body: "You can delete your account or workspace at any time in Settings. We may suspend accounts that break these terms." },
  { title: "Questions", body: `Email ${site.supportEmail}.` },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <PageIntro title="Terms">The rules for using {site.name}, in plain language.</PageIntro>
      <Prose sections={sections} />
    </section>
  );
}
