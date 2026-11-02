import type { Metadata } from "next";
import { PageIntro, Prose } from "@/components/marketing";
import { site } from "@/config/site";

// Template wording. Stays out of search until it's been reviewed for your product.
export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${site.name} collects and why.`,
  robots: { index: false, follow: true },
};

const sections = [
  { title: "What we collect", body: "Your name, email address and password hash when you sign up, and whatever you add to your workspace. If you sign in with Google, we receive your name and email from Google." },
  { title: "Why we collect it", body: "To run your account, keep your workspace's data separate from everyone else's, and send messages your account depends on, such as invitations and password resets." },
  { title: "Who else handles it", body: "Polar processes payments and we never see your full card number. Our hosting, database and email providers process data on our behalf. We don't sell your data." },
  { title: "Analytics", body: "We measure page views and site speed with Vercel Analytics, which doesn't use cookies to follow you across websites." },
  { title: "Your choices", body: `You can change your details or delete your account in Settings. Deleting a workspace removes its data. For anything else, email ${site.supportEmail}.` },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <PageIntro title="Privacy">What we collect, why, and what you can do about it.</PageIntro>
      <Prose sections={sections} />
    </section>
  );
}
