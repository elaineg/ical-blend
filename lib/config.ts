/** Blend config validation and normalization. */

/** A single source feed with optional per-feed controls. */
export interface SourceConfig {
  url: string;
  /** Short string prepended to every event SUMMARY from this feed. Max 40 chars. */
  prefix?: string;
  /** Mask only this feed's events to "Busy" (same semantics as global busyOnly). */
  busyOnly?: boolean;
  /** Drop all-day VEVENTs (DATE-valued DTSTART) from this feed only. */
  hideAllDay?: boolean;
}

export interface BlendConfig {
  /**
   * 1–5 source feeds. Each element is either the new SourceConfig object (with
   * url + optional per-feed controls) or a legacy plain string URL.
   * Use normalizeSource() to always get a SourceConfig.
   */
  sources: Array<SourceConfig | string>;
  include?: string;
  exclude?: string;
  busyOnly?: boolean;
}

/** Normalize a source element (legacy string or new object) into a SourceConfig. */
export function normalizeSource(s: SourceConfig | string): SourceConfig {
  if (typeof s === "string") return { url: s };
  return s;
}

export const MIN_SOURCES = 1;
export const MAX_SOURCES = 5;
export const MAX_URL_LENGTH = 500;
export const MAX_FILTER_LENGTH = 100;
export const MAX_PREFIX_LENGTH = 40;

export interface ValidationResult {
  ok: boolean;
  config?: BlendConfig;
  error?: string;
}

/** Validate and normalize a single raw URL string, applying SSRF guards. */
function validateUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
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
  return { ok: true, url: url.toString() };
}

/**
 * Validate raw input into a BlendConfig. Accepts webcal:// (normalized to
 * https://). Accepts BOTH the new per-feed object form AND legacy plain string
 * elements in sources[] — strings are normalized to { url: s }.
 * Returns a descriptive error rather than throwing.
 */
export function validateConfig(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const obj = input as Record<string, unknown>;

  if (!Array.isArray(obj.sources)) {
    return { ok: false, error: "sources must be an array of feed URLs." };
  }

  // Filter out blank entries (support both string and object forms).
  const rawSources = (obj.sources as unknown[]).filter((s) => {
    if (typeof s === "string") return s.trim().length > 0;
    if (typeof s === "object" && s !== null) {
      const o = s as Record<string, unknown>;
      return typeof o.url === "string" && o.url.trim().length > 0;
    }
    return false;
  });

  if (rawSources.length < MIN_SOURCES || rawSources.length > MAX_SOURCES) {
    return {
      ok: false,
      error: rawSources.length === 0
        ? "Add at least one calendar feed URL to get started."
        : `Provide up to ${MAX_SOURCES} source URLs (got ${rawSources.length}).`,
    };
  }

  const sources: SourceConfig[] = [];
  for (const raw of rawSources) {
    // Normalize: legacy string → SourceConfig; object → extract fields.
    let rawUrl: string;
    let prefix: string | undefined;
    let busyOnly: boolean | undefined;
    let hideAllDay: boolean | undefined;

    if (typeof raw === "string") {
      rawUrl = raw.trim();
    } else {
      const o = raw as Record<string, unknown>;
      rawUrl = typeof o.url === "string" ? o.url.trim() : "";
      prefix = typeof o.prefix === "string" ? o.prefix : undefined;
      busyOnly = o.busyOnly === true ? true : undefined;
      hideAllDay = o.hideAllDay === true ? true : undefined;
    }

    const urlResult = validateUrl(rawUrl);
    if (!urlResult.ok) return { ok: false, error: urlResult.error };

    const src: SourceConfig = { url: urlResult.url };
    if (prefix !== undefined) {
      // Use trimStart() so trailing whitespace (e.g. "[Work] ") is preserved as
      // typed — the trailing space is the intended separator before the event title.
      // Leading whitespace is stripped as it is always unintentional.
      const leadTrimmed = prefix.trimStart();
      // Determine emptiness by fully trimming; store only the lead-trimmed value.
      if (leadTrimmed.trim().length > 0) {
        if (leadTrimmed.length > MAX_PREFIX_LENGTH) {
          return {
            ok: false,
            error: `Title prefix too long (max ${MAX_PREFIX_LENGTH} chars).`,
          };
        }
        src.prefix = leadTrimmed;
      }
    }
    if (busyOnly) src.busyOnly = true;
    if (hideAllDay) src.hideAllDay = true;

    sources.push(src);
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
