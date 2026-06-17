import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { BlendConfig } from "../lib/config";
import { decryptToken, encryptConfig, getKeyFromEnv } from "../lib/token";

const key = randomBytes(32);

const config: BlendConfig = {
  sources: [
    "https://calendar.google.com/calendar/ical/someone%40example.com/private-abc123/basic.ics",
    "https://outlook.office365.com/owa/calendar/x/y/calendar.ics",
  ],
  include: "piano",
  exclude: "standup",
  busyOnly: true,
};

describe("token encrypt/decrypt", () => {
  it("round-trips a config", () => {
    const token = encryptConfig(config, key);
    expect(decryptToken(token, key)).toEqual(config);
  });

  it("produces URL-safe tokens (single path segment)", () => {
    const token = encryptConfig(config, key);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("is opaque without the key: decoded bytes leak no source URLs or JSON", () => {
    const token = encryptConfig(config, key);
    const decoded = Buffer.from(token, "base64url");
    const printable = decoded.toString("latin1");
    expect(printable).not.toContain("https://");
    expect(printable).not.toContain("calendar.google.com");
    expect(printable).not.toContain('"sources"');
  });

  it("uses a random IV: same config yields different tokens", () => {
    expect(encryptConfig(config, key)).not.toBe(encryptConfig(config, key));
  });

  it("rejects a tampered token (any single-character change)", () => {
    const token = encryptConfig(config, key);
    const i = Math.floor(token.length / 2);
    const flipped = token[i] === "A" ? "B" : "A";
    const tampered = token.slice(0, i) + flipped + token.slice(i + 1);
    expect(() => decryptToken(tampered, key)).toThrow();
  });

  it("rejects decryption with the wrong key", () => {
    const token = encryptConfig(config, key);
    expect(() => decryptToken(token, randomBytes(32))).toThrow();
  });

  it("rejects garbage tokens", () => {
    expect(() => decryptToken("not a token!!", key)).toThrow();
    expect(() => decryptToken("AAAA", key)).toThrow();
  });

  it("keeps the URL short: 5 long sources stay under 2000 chars total", () => {
    const longConfig: BlendConfig = {
      sources: Array.from({ length: 5 }, (_, i) =>
        `https://calendar.example-host-${i}.com/calendar/ical/user.name%40longcompanydomain.com/private-${"a1b2c3d4".repeat(8)}/basic.ics`.padEnd(
          180,
          "x"
        )
      ),
      include: "family",
      exclude: "standup",
      busyOnly: true,
    };
    const token = encryptConfig(longConfig, key);
    const fullUrl = `https://ical-blend.vercel.app/api/feed/${token}`;
    expect(fullUrl.length).toBeLessThan(2000);
  });
});

describe("token round-trip: per-feed SourceConfig fields", () => {
  it("round-trips prefix, busyOnly, hideAllDay through encrypt/decrypt", () => {
    const perFeedConfig: BlendConfig = {
      sources: [
        { url: "https://a.example.com/cal.ics", prefix: "[Work]", busyOnly: true, hideAllDay: false },
        { url: "https://b.example.com/cal.ics" },
        { url: "https://c.example.com/cal.ics", hideAllDay: true },
      ],
    };
    const token = encryptConfig(perFeedConfig, key);
    const recovered = decryptToken(token, key);
    expect(recovered.sources).toHaveLength(3);
    const s0 = recovered.sources[0] as { url: string; prefix?: string; busyOnly?: boolean; hideAllDay?: boolean };
    expect(s0.url).toBe("https://a.example.com/cal.ics");
    expect(s0.prefix).toBe("[Work]");
    expect(s0.busyOnly).toBe(true);
    // hideAllDay: false — validateConfig would strip it, but the token carries what was given
    const s1 = recovered.sources[1] as { url: string; prefix?: string };
    expect(s1.url).toBe("https://b.example.com/cal.ics");
    expect(s1.prefix).toBeUndefined();
    const s2 = recovered.sources[2] as { url: string; hideAllDay?: boolean };
    expect(s2.hideAllDay).toBe(true);
  });

  it("legacy string[] round-trips with no per-feed fields injected", () => {
    const legacyConfig: BlendConfig = {
      sources: ["https://a.example.com/cal.ics", "https://b.example.com/cal.ics"],
    };
    const token = encryptConfig(legacyConfig, key);
    const recovered = decryptToken(token, key);
    for (const src of recovered.sources) {
      if (typeof src === "string") {
        // legacy string — no object fields
        expect(typeof src).toBe("string");
      } else {
        expect((src as { prefix?: string }).prefix).toBeUndefined();
        expect((src as { busyOnly?: boolean }).busyOnly).toBeUndefined();
        expect((src as { hideAllDay?: boolean }).hideAllDay).toBeUndefined();
      }
    }
  });
});

describe("getKeyFromEnv", () => {
  it("accepts a 64-char hex key", () => {
    const hex = randomBytes(32).toString("hex");
    expect(getKeyFromEnv({ ENCRYPTION_KEY: hex } as NodeJS.ProcessEnv)).toEqual(
      Buffer.from(hex, "hex")
    );
  });

  it("accepts a base64 key", () => {
    const b = randomBytes(32);
    expect(
      getKeyFromEnv({ ENCRYPTION_KEY: b.toString("base64") } as NodeJS.ProcessEnv)
    ).toEqual(b);
  });

  it("fails fast when unset or wrong length", () => {
    expect(() => getKeyFromEnv({} as NodeJS.ProcessEnv)).toThrow(/ENCRYPTION_KEY/);
    expect(() =>
      getKeyFromEnv({ ENCRYPTION_KEY: "abcd" } as NodeJS.ProcessEnv)
    ).toThrow(/32 bytes/);
  });
});
