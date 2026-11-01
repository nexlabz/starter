import { getEnv } from "./env";

export type Email = { to: string; subject: string; text: string; html?: string };

/**
 * Minimal email adapter. With RESEND_API_KEY it sends through Resend's HTTP API;
 * without it, the message is printed to the server console so sign-up / invite
 * links work in local development with zero accounts.
 * In production without a key we throw: silently dropping auth mail is worse than failing loudly.
 */
export async function sendEmail(mail: Email): Promise<void> {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is required in production to send email.");
    console.log(`\n[email:dev] to=${mail.to}\n  subject: ${mail.subject}\n  ${mail.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}
