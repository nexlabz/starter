import { describe, expect, it } from "vitest";
import { usage } from "@/lib/usage";

describe("usage", () => {
  it("is fine with room to spare", () => {
    expect(usage(1, 10)).toEqual({ state: "ok", left: 9, label: "9 left" });
  });

  it("warns at 80% and on the last one", () => {
    expect(usage(8, 10).state).toBe("near");
    expect(usage(2, 3).state).toBe("near");
  });

  it("is full at or over the limit, as after a downgrade", () => {
    expect(usage(3, 3).state).toBe("full");
    expect(usage(5, 3)).toEqual({ state: "full", left: 0, label: "Limit reached" });
  });
});
