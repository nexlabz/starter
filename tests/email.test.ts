import { afterEach, describe, expect, it, vi } from "vitest";

const mail = { to: "a@example.com", subject: "s", text: "t" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function load(nodeEnv: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("RESEND_API_KEY", "");
  return import("@/lib/email");
}

describe("email without a provider", () => {
  it("an invitation does not fail in production", async () => {
    const { sendInvitation } = await load("production");
    await expect(sendInvitation(mail)).resolves.toBeUndefined();
  });

  it("other auth mail still fails loudly in production", async () => {
    const { sendEmail } = await load("production");
    await expect(sendEmail(mail)).rejects.toThrow(/RESEND_API_KEY/);
  });
});
