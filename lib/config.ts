/** Blend config validation and normalization. */

export interface BlendConfig {
  /** 2-5 normalized https/http source URLs. */
  sources: string[];
  include?: string;
  exclude?: string;
  busyOnly?: boolean;
}

export const MIN_SOURCES = 1;
export const MAX_SOURCES = 5;
export const MAX_URL_LENGTH = 500;
export const MAX_FILTER_LENGTH = 100;

export interface ValidationResult {
  ok: boolean;
  config?: BlendConfig;
  error?: string;
}

/**
 * Validate raw input into a BlendConfig. Accepts webcal:// (normalized to
 * https://). Returns a descriptive error rather than throwing.
 */
export function validateConfig(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const obj = input as Record<string, unknown>;

  if (!Array.isArray(obj.sources)) {
    return { ok: false, error: "sources must be an array of feed URLs." };
  }
  const rawSources = obj.sources
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.length > 0);

  if (rawSources.length < MIN_SOURCES || rawSources.length > MAX_SOURCES) {
    return {
      ok: false,
      error: rawSources.length === 0
        ? "Add at least one calendar feed URL to get started."
        : `Provide up to ${MAX_SOURCES} source URLs (got ${rawSources.length}).`,
    };
  }

  const sources: string[] = [];
  for (const raw of rawSources) {
    const normalized = raw.replace(/^webcal:\/\//i, "https://");
    if (normalized.length > MAX_URL_LENGTH) {
      return { ok: false, error: `Source URL too long (max ${MAX_URL_LENGTH} chars).` };
    }
    let url: URL;
    try {
      url = new URL(normalized);
    } catch {
      return {
        ok: false,
        error: `That doesn't look like a calendar feed URL (needs to start with https:// or webcal://): ${raw.slice(0, 80)}`,
      };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return {
        ok: false,
        error: `That doesn't look like a calendar feed URL (needs to start with https:// or webcal://): ${raw.slice(0, 80)}`,
      };
    }
    // Block localhost, link-local, and .local addresses (SSRF guard).
    const h = url.hostname.toLowerCase();
    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "0.0.0.0" ||
      h === "[::1]" ||
      h.endsWith(".local") ||
      /^169\.254\./.test(h) ||        // IPv4 link-local
      /^fe80:/i.test(h) ||             // IPv6 link-local
      /^10\./.test(h) ||               // RFC1918
      /^192\.168\./.test(h) ||         // RFC1918
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) // RFC1918
    ) {
      return {
        ok: false,
        error: `Local or private addresses aren't allowed as calendar sources: ${raw.slice(0, 80)}`,
      };
    }
    sources.push(url.toString());
  }

  const config: BlendConfig = { sources };

  for (const field of ["include", "exclude"] as const) {
    const v = obj[field];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v !== "string") {
      return { ok: false, error: `${field} filter must be a string.` };
    }
    const trimmed = v.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > MAX_FILTER_LENGTH) {
      return {
        ok: false,
        error: `${field} filter too long (max ${MAX_FILTER_LENGTH} chars).`,
      };
    }
    config[field] = trimmed;
  }

  if (obj.busyOnly === true) config.busyOnly = true;

  return { ok: true, config };
}
