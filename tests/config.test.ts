import { describe, expect, it } from "vitest";
import { validateConfig } from "../lib/config";

const twoUrls = ["https://a.example.com/cal.ics", "https://b.example.com/cal.ics"];

describe("validateConfig", () => {
  it("accepts 2-5 https URLs", () => {
    const r = validateConfig({ sources: twoUrls });
    expect(r.ok).toBe(true);
    expect(r.config?.sources).toHaveLength(2);
  });

  it("normalizes webcal:// to https://", () => {
    const r = validateConfig({
      sources: ["webcal://a.example.com/cal.ics", twoUrls[1]],
    });
    expect(r.ok).toBe(true);
    expect(r.config?.sources[0]).toBe("https://a.example.com/cal.ics");
  });

  it("rejects fewer than 2 sources (blank entries ignored)", () => {
    expect(validateConfig({ sources: [twoUrls[0], "  "] }).ok).toBe(false);
    expect(validateConfig({ sources: [] }).ok).toBe(false);
  });

  it("rejects more than 5 sources", () => {
    const r = validateConfig({
      sources: Array.from({ length: 6 }, (_, i) => `https://h${i}.example.com/c.ics`),
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/between 2 and 5/);
  });

  it("rejects non-http(s) schemes and invalid URLs", () => {
    expect(validateConfig({ sources: ["ftp://a.com/x.ics", twoUrls[1]] }).ok).toBe(false);
    expect(validateConfig({ sources: ["not a url", twoUrls[1]] }).ok).toBe(false);
    expect(
      validateConfig({ sources: ["javascript:alert(1)", twoUrls[1]] }).ok
    ).toBe(false);
  });

  it("rejects oversized URLs and filters", () => {
    expect(
      validateConfig({ sources: [`https://a.example.com/${"x".repeat(600)}`, twoUrls[1]] }).ok
    ).toBe(false);
    expect(
      validateConfig({ sources: twoUrls, include: "x".repeat(101) }).ok
    ).toBe(false);
  });

  it("trims filters, drops empties, and only sets busyOnly on true", () => {
    const r = validateConfig({
      sources: twoUrls,
      include: "  piano ",
      exclude: "",
      busyOnly: "yes",
    });
    expect(r.ok).toBe(true);
    expect(r.config?.include).toBe("piano");
    expect(r.config?.exclude).toBeUndefined();
    expect(r.config?.busyOnly).toBeUndefined();
  });

  it("rejects non-object bodies", () => {
    expect(validateConfig(null).ok).toBe(false);
    expect(validateConfig("x").ok).toBe(false);
  });
});
