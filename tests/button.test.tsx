import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("disables itself and shows a spinner while pending", () => {
    const html = renderToStaticMarkup(<Button pending>Save</Button>);
    expect(html).toMatch(/\sdisabled=/);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("animate-spin");
  });

  it("recovers once no longer pending", () => {
    const html = renderToStaticMarkup(<Button pending={false}>Save</Button>);
    expect(html).not.toMatch(/\sdisabled=/);
    expect(html).not.toContain("aria-busy");
  });

  it("stays disabled when the caller disables it", () => {
    expect(renderToStaticMarkup(<Button disabled pending={false}>Save</Button>)).toMatch(/\sdisabled=/);
  });
});
