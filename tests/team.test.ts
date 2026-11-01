import { describe, expect, it } from "vitest";
import { memberControls } from "@/lib/team";

const row = (viewerRole: string, targetRole: string, opts: { self?: boolean; ownerCount?: number } = {}) =>
  memberControls({ viewerRole, targetRole, self: opts.self ?? false, ownerCount: opts.ownerCount ?? 1 });

describe("memberControls", () => {
  it("lets owners and admins manage members", () => {
    expect(row("owner", "member").manageable).toBe(true);
    expect(row("admin", "member").manageable).toBe(true);
    expect(row("admin", "admin").manageable).toBe(true);
  });

  it("gives plain members no controls", () => {
    expect(row("member", "member").manageable).toBe(false);
  });

  it("never offers to remove or demote the last owner", () => {
    expect(row("owner", "owner", { ownerCount: 1 }).manageable).toBe(false);
  });

  it("lets an owner manage another owner, but not an admin", () => {
    expect(row("owner", "owner", { ownerCount: 2 }).manageable).toBe(true);
    expect(row("admin", "owner", { ownerCount: 2 }).manageable).toBe(false);
  });

  it("offers no controls on your own row", () => {
    expect(row("owner", "owner", { self: true, ownerCount: 2 }).manageable).toBe(false);
  });

  it("only owners can grant owner", () => {
    expect(row("owner", "member").roles).toContain("owner");
    expect(row("admin", "member").roles).not.toContain("owner");
  });

  it("handles comma-separated roles", () => {
    expect(row("member,admin", "member").manageable).toBe(true);
  });
});
