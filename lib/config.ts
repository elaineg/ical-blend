/** Blend config validation and normalization. */

export interface BlendConfig {
  /** 2-5 normalized https/http source URLs. */
  sources: string[];
  include?: string;
  exclude?: string;
  busyOnly?: boolean;
}

export const MIN_SOURCES = 2;
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
      error: `Provide between ${MIN_SOURCES} and ${MAX_SOURCES} source URLs (got ${rawSources.length}).`,
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
      return { ok: false, error: `Not a valid URL: ${raw.slice(0, 80)}` };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return {
        ok: false,
        error: `Unsupported URL scheme "${url.protocol}//" — use http(s) or webcal.`,
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
