"use client";

import { useEffect, useRef, useState } from "react";

interface PreviewEvent {
  summary: string;
  start: string | null;
  allDay: boolean;
  sourceLabel?: string | null;
}

interface CreateResult {
  feedPath: string;
  failedSources: number[];
  failedReasons: Record<number, string>; // 1-based index → reason string
  totalEventCount: number;
  previewEvents: PreviewEvent[];
  applied: {
    include: string | null;
    exclude: string | null;
    busyOnly: boolean;
    sourceCount: number;
    feedsLabelled?: number;
    feedsMasked?: number;
  };
}

/** Per-source fetch result returned by /api/preview */
interface SourceFetchResult {
  index: number;
  label: string;
  ok: boolean;
  count: number;
  reason: string;
}

/** Full preview panel data returned by /api/preview */
interface PreviewData {
  perSource: SourceFetchResult[];
  fetched: number;
  kept: number;
  events: PreviewEvent[];
  allFailed: boolean;
  failedCount: number;
  sourceCount: number;
}

const RECENT_BLENDS_KEY = "ical-blend:recent-v1";
const MAX_RECENT = 10;

interface RecentBlend {
  url: string;
  nickname: string;
  createdAt: string; // ISO string
}

function loadRecent(): RecentBlend[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_BLENDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentBlend[];
  } catch {
    return [];
  }
}

function saveRecent(blend: RecentBlend): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadRecent();
    // Deduplicate by URL; newest first.
    const updated = [
      blend,
      ...existing.filter((b) => b.url !== blend.url),
    ].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_BLENDS_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable; silently skip.
  }
}

function updateRecentNickname(url: string, nickname: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadRecent();
    const updated = existing.map((b) => (b.url === url ? { ...b, nickname } : b));
    window.localStorage.setItem(RECENT_BLENDS_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable; silently skip.
  }
}

interface FieldError {
  index: number;
  message: string;
}

/** Per-feed optional controls. */
interface FeedOptions {
  prefix: string;
  busyOnly: boolean;
  hideAllDay: boolean;
  include: string;
  exclude: string;
}

function defaultFeedOptions(): FeedOptions {
  return { prefix: "", busyOnly: false, hideAllDay: false, include: "", exclude: "" };
}

function feedOptionsActive(opts: FeedOptions): boolean {
  return (
    opts.prefix.trim().length > 0 ||
    opts.busyOnly ||
    opts.hideAllDay ||
    opts.include.trim().length > 0 ||
    opts.exclude.trim().length > 0
  );
}

function formatStart(ev: PreviewEvent): string {
  if (!ev.start) return "no date";
  const d = new Date(ev.start);
  if (ev.allDay) {
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isValidCalendarUrl(raw: string): { ok: true } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, message: "Add at least one calendar feed URL." };
  const normalized = trimmed.replace(/^webcal:\/\//i, "https://");
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return {
      ok: false,
      message: "That doesn't look like a calendar feed URL (needs to start with https:// or webcal://).",
    };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return {
      ok: false,
      message: "That doesn't look like a calendar feed URL (needs to start with https:// or webcal://).",
    };
  }
  const h = url.hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "[::1]" ||
    h.endsWith(".local") ||
    /^169\.254\./.test(h) ||
    /^fe80:/i.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    return {
      ok: false,
      message: "Local or private addresses aren't allowed as calendar sources.",
    };
  }
  return { ok: true };
}

// Demo sample config — two confirmed-live public ICS feeds (verified curl 200 + ICS).
// Source 1: UK Bank Holidays (gov.uk) — stable, official, text/calendar
// Source 2: Chelsea FC fixtures (fixtur.es) — stable, public sports calendar
const SAMPLE_SOURCES = [
  "https://www.gov.uk/bank-holidays/england-and-wales.ics",
  "https://ics.fixtur.es/v2/home/chelsea.ics",
];
const SAMPLE_OPTIONS: FeedOptions[] = [
  { ...defaultFeedOptions(), prefix: "[Holidays] " },
  { ...defaultFeedOptions(), prefix: "[Personal] " },
];

/** Build the sources payload for API calls (same shape for /api/token and /api/preview). */
function buildSourcesPayload(
  sources: string[],
  feedOptions: FeedOptions[]
): Record<string, unknown>[] {
  const filledIndices: number[] = [];
  sources.forEach((s, i) => {
    if (s.trim().length > 0) filledIndices.push(i);
  });
  return filledIndices.map((i) => {
    const opts = feedOptions[i];
    const src: Record<string, unknown> = { url: sources[i].trim() };
    if (opts.prefix.trimStart().trim()) src.prefix = opts.prefix.trimStart();
    if (opts.busyOnly) src.busyOnly = true;
    if (opts.hideAllDay) src.hideAllDay = true;
    if (opts.include.trim()) src.include = opts.include.trim();
    if (opts.exclude.trim()) src.exclude = opts.exclude.trim();
    return src;
  });
}

/** Preview panel component — shared between pre-create and post-create views. */
function PreviewPanel({
  data,
  loading,
}: {
  data: PreviewData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        data-testid="preview-panel"
        role="status"
        aria-label="Loading preview"
        className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500"
      >
        Fetching your feeds…
      </div>
    );
  }
  if (!data) return null;

  const { perSource, fetched, kept, events, allFailed, failedCount } = data;
  const partialFail = failedCount > 0 && !allFailed;

  return (
    <div data-testid="preview-panel" className="mt-4 space-y-0">
      {/* ── Zone 1: Per-source STATUS ── */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Status
        </p>
        <ul className="space-y-1.5" data-testid="preview-source-status">
          {perSource.map((src) => (
            <li
              key={src.index}
              data-testid={`preview-source-${src.index}`}
              className="flex items-start gap-2 text-sm"
            >
              <span className="shrink-0 w-4 text-center leading-5">
                {src.ok ? (
                  <span aria-label="alive" className="text-gray-800 font-semibold">✓</span>
                ) : (
                  <span aria-label="failed" className="text-red-600 font-semibold">✗</span>
                )}
              </span>
              <span className="min-w-0 flex-1 leading-5">
                <span className="font-medium text-gray-800 break-all">{src.label}</span>
                {src.ok ? (
                  <span className="ml-1 text-gray-500">— {src.count} event{src.count !== 1 ? "s" : ""} fetched</span>
                ) : (
                  <span className="ml-1 text-red-600">— {src.reason}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Zone 2: RECONCILIATION COUNT ── */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        {allFailed ? (
          <p
            role="alert"
            data-testid="preview-all-failed"
            className="text-sm font-semibold text-red-600"
          >
            No feeds could be fetched — check the URLs above.
          </p>
        ) : (
          <>
            <p
              data-testid="preview-reconciliation"
              className="text-base font-semibold text-gray-900"
            >
              {"Fetched "}{fetched}{" event"}{fetched !== 1 ? "s" : ""}{" → kept "}{kept}{" after filters & mask"}
            </p>
            {fetched > kept && kept > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                ({fetched - kept} removed by filters/mask)
              </p>
            )}
            {partialFail && (
              <p
                role="status"
                data-testid="preview-partial-fail"
                className="text-xs text-amber-700 mt-1"
              >
                {failedCount} source{failedCount !== 1 ? "s" : ""} failed — {failedCount !== 1 ? "their" : "its"} events are not included.
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Zone 3: PREVIEW list ── */}
      {!allFailed && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Preview · Next 15
          </p>
          {kept === 0 ? (
            <p
              role="status"
              data-testid="preview-zero-kept"
              className="text-sm text-gray-500"
            >
              0 kept — your filters removed every event. Loosen a keyword or mask above.
            </p>
          ) : events.length === 0 ? (
            <p
              role="status"
              data-testid="preview-no-upcoming"
              className="text-sm text-gray-500"
            >
              No upcoming events in the next few months. Check your source feeds.
            </p>
          ) : (
            <ul
              data-testid="preview-list"
              className="divide-y divide-gray-100"
            >
              {events.map((ev, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span className="shrink-0 tabular-nums text-xs text-gray-500 sm:w-32">
                    {formatStart(ev)}
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-gray-900 break-words">
                    {ev.summary}
                  </span>
                  {ev.sourceLabel && (
                    <span className="shrink-0 text-xs text-gray-400">{ev.sourceLabel}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [sources, setSources] = useState<string[]>(["", ""]);
  const [feedOptions, setFeedOptions] = useState<FeedOptions[]>([
    defaultFeedOptions(),
    defaultFeedOptions(),
  ]);
  // Track which rows have their Options panel open.
  const [optionsOpen, setOptionsOpen] = useState<boolean[]>([false, false]);
  // Device-local recent blends (loaded after mount to avoid SSR mismatch).
  const [recentBlends, setRecentBlends] = useState<RecentBlend[]>([]);

  useEffect(() => {
    setRecentBlends(loadRecent());
  }, []);

  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [busyOnly, setBusyOnly] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [copied, setCopied] = useState<"https" | "webcal" | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentCopied, setRecentCopied] = useState<number | null>(null);
  const recentCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preview state — pre-create and post-create share this panel.
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const webcalUrl = feedUrl ? feedUrl.replace(/^https?:\/\//, "webcal://") : null;

  /** Returns true if there is at least one non-empty source URL. */
  function hasAnySources(): boolean {
    return sources.some((s) => s.trim().length > 0);
  }

  function setSource(i: number, value: string) {
    setSources((prev) => prev.map((s, j) => (j === i ? value : s)));
    setFieldErrors((prev) => prev.filter((e) => e.index !== i));
  }

  function setFeedOpt<K extends keyof FeedOptions>(i: number, key: K, value: FeedOptions[K]) {
    setFeedOptions((prev) =>
      prev.map((opts, j) => (j === i ? { ...opts, [key]: value } : opts))
    );
  }

  function toggleOptions(i: number) {
    setOptionsOpen((prev) => prev.map((v, j) => (j === i ? !v : v)));
  }

  function addSource() {
    setSources((prev) => [...prev, ""]);
    setFeedOptions((prev) => [...prev, defaultFeedOptions()]);
    setOptionsOpen((prev) => [...prev, false]);
  }

  function removeSource(i: number) {
    setSources((prev) => prev.filter((_, j) => j !== i));
    setFeedOptions((prev) => prev.filter((_, j) => j !== i));
    setOptionsOpen((prev) => prev.filter((_, j) => j !== i));
    setFieldErrors((prev) => prev.filter((e) => e.index !== i));
  }

  /** Load the sample/demo config into the form, then immediately auto-run the preview. */
  function loadSample() {
    const sampleSources = SAMPLE_SOURCES.slice();
    const sampleOptions = SAMPLE_OPTIONS.map((o) => ({ ...o }));
    // Expand to 2 rows if needed.
    setSources(sampleSources);
    setFeedOptions(sampleOptions);
    setOptionsOpen([false, false]);
    setFieldErrors([]);
    setError(null);
    // Clear any existing feed URL and preview so the user starts fresh.
    setFeedUrl(null);
    setResult(null);
    setPreviewData(null);
    setPreviewError(null);
    // Auto-run the preview immediately — pass sample values directly so we don't
    // depend on React state having flushed (state updates are async).
    runPreview({ sources: sampleSources, feedOptions: sampleOptions, include: "", exclude: "", busyOnly: false });
  }

  async function copy(text: string, which: "https" | "webcal") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable; the URL is selectable text anyway.
    }
  }

  /** Run the preview — calls /api/preview with the current config.
   *  Accepts optional overrides so loadSample can pass values before React
   *  state has flushed (React state updates are async). */
  async function runPreview(overrides?: {
    sources?: string[];
    feedOptions?: FeedOptions[];
    include?: string;
    exclude?: string;
    busyOnly?: boolean;
  }) {
    setPreviewError(null);
    setPreviewData(null);
    setPreviewLoading(true);

    const effectiveSources = overrides?.sources ?? sources;
    const effectiveFeedOptions = overrides?.feedOptions ?? feedOptions;
    const effectiveInclude = overrides?.include ?? include;
    const effectiveExclude = overrides?.exclude ?? exclude;
    const effectiveBusyOnly = overrides?.busyOnly ?? busyOnly;

    const sourcesPayload = buildSourcesPayload(effectiveSources, effectiveFeedOptions);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: sourcesPayload,
          include: effectiveInclude,
          exclude: effectiveExclude,
          busyOnly: effectiveBusyOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error ?? "Could not run preview.");
        return;
      }
      setPreviewData(data as PreviewData);
    } catch {
      setPreviewError("Network error — please try again.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function createFeed(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setFeedUrl(null);
    setResult(null);

    const filledIndices: number[] = [];
    sources.forEach((s, i) => {
      if (s.trim().length > 0) filledIndices.push(i);
    });

    if (filledIndices.length === 0) {
      setError("Add at least one calendar feed URL to get started.");
      return;
    }

    const newFieldErrors: FieldError[] = [];
    sources.forEach((s, i) => {
      if (!s.trim()) return;
      const check = isValidCalendarUrl(s);
      if (!check.ok) newFieldErrors.push({ index: i, message: check.message });
    });
    if (newFieldErrors.length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    const sourcesPayload = buildSourcesPayload(sources, feedOptions);

    setWorking(true);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: sourcesPayload,
          include,
          exclude,
          busyOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the feed.");
        return;
      }
      const url = `${window.location.origin}${data.feedPath}`;
      setFeedUrl(url);
      const newResult: CreateResult = {
        feedPath: data.feedPath,
        failedSources: data.failedSources ?? [],
        failedReasons: data.failedReasons ?? {},
        totalEventCount: data.totalEventCount ?? 0,
        previewEvents: data.previewEvents ?? [],
        applied: data.applied ?? {
          include: null,
          exclude: null,
          busyOnly: false,
          sourceCount: filledIndices.length,
        },
      };
      setResult(newResult);
      // After Create, show the preview panel populated from the token response
      // (re-uses the same PreviewPanel component — post-create confirmation story).
      const postCreatePreview: PreviewData = {
        perSource: (data.previewEvents ?? []).length > 0
          ? sourcesPayload.map((src, i) => ({
              index: i,
              label: (src.prefix as string | undefined) ?? (() => { try { return new URL(src.url as string).hostname; } catch { return String(src.url).slice(0, 40); } })(),
              ok: !(data.failedSources ?? []).includes(i + 1),
              count: 0, // unknown at create-time without per-source counts
              reason: data.failedReasons?.[i + 1] ?? "",
            }))
          : [],
        fetched: data.totalEventCount ?? 0,
        kept: data.totalEventCount ?? 0,
        events: data.previewEvents ?? [],
        allFailed: (data.failedSources ?? []).length === sourcesPayload.length,
        failedCount: (data.failedSources ?? []).length,
        sourceCount: sourcesPayload.length,
      };
      setPreviewData(postCreatePreview);
      // Save to device-local recent blends (SSR-safe: only runs client-side).
      const newBlend: RecentBlend = {
        url,
        nickname: "",
        createdAt: new Date().toISOString(),
      };
      saveRecent(newBlend);
      setRecentBlends(loadRecent());
    } catch {
      setError("Network error — please try again.");
    } finally {
      setWorking(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700";
  const inputErrorClass =
    "w-full border border-red-400 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

  const previewCanRun = hasAnySources() && !working;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        Stop checking three calendars: blend your work, personal, and shared calendars into one
        link you subscribe to once — and hand others a version with the private titles hidden.
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Paste 2–5 calendar links. Preview &amp; test them, then get one feed. No account.
      </p>

      {/* Load a sample feed — cold-start on-ramp */}
      <div className="mt-4">
        <button
          type="button"
          data-testid="load-sample"
          onClick={loadSample}
          className="text-xs font-semibold uppercase tracking-widest underline text-gray-500 hover:text-gray-800"
        >
          Load a sample feed
        </button>
      </div>

      <form onSubmit={createFeed} className="mt-6 space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">
            Source feeds (ICS / webcal URLs)
          </legend>
          {sources.map((s, i) => {
            const fieldError = fieldErrors.find((e) => e.index === i);
            const opts = feedOptions[i] ?? defaultFeedOptions();
            const open = optionsOpen[i] ?? false;
            const active = feedOptionsActive(opts);
            return (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="url"
                    placeholder={`https://example.com/calendar-${i + 1}.ics`}
                    value={s}
                    onChange={(e) => setSource(i, e.target.value)}
                    data-testid={`source-${i}`}
                    aria-label={`Source feed URL ${i + 1}`}
                    aria-invalid={fieldError ? "true" : undefined}
                    aria-describedby={fieldError ? `source-error-${i}` : undefined}
                    className={fieldError ? inputErrorClass : inputClass}
                  />
                  {sources.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove source ${i + 1}`}
                      onClick={() => removeSource(i)}
                      className="border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      &times;
                    </button>
                  )}
                </div>
                {fieldError && (
                  <p
                    id={`source-error-${i}`}
                    role="alert"
                    data-testid={`source-error-${i}`}
                    className="mt-1 text-xs text-red-600"
                  >
                    {fieldError.message}
                  </p>
                )}

                {/* Per-feed Options disclosure — always rendered on every row */}
                <div className="pl-1">
                  <button
                    type="button"
                    data-testid={`options-toggle-${i}`}
                    aria-expanded={open}
                    onClick={() => toggleOptions(i)}
                    className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-gray-100 text-gray-800 ring-1 ring-gray-300 hover:bg-gray-200"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <span
                      className="inline-block transition-transform"
                      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
                      aria-hidden="true"
                    >
                      ▸
                    </span>
                    {active ? (
                      <span>Options &amp; filters · on</span>
                    ) : (
                      <span>
                        Options &amp; filters
                        {!open && (
                          <span className="ml-1.5 text-gray-400 font-normal">prefix · keyword filter · mask</span>
                        )}
                      </span>
                    )}
                  </button>
                  {/* Inline filter badge when collapsed + active */}
                  {!open && active && (
                    <span
                      data-testid={`options-active-badge-${i}`}
                      className="ml-1 inline-flex items-center bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                    >
                      {[
                        opts.include.trim() && `include: ${opts.include.trim().split(",")[0].trim()}`,
                        opts.exclude.trim() && `exclude: ${opts.exclude.trim().split(",")[0].trim()}`,
                        opts.prefix.trim() && `prefix`,
                        opts.busyOnly && `mask`,
                        opts.hideAllDay && `hide all-day`,
                      ]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(" · ") || "options set"}
                    </span>
                  )}

                  {open && (
                    <div
                      data-testid={`options-panel-${i}`}
                      className="mt-2 space-y-3 border border-gray-100 bg-gray-50 p-3 text-sm"
                    >
                      {/* Title prefix */}
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-600">
                          Label added to this feed&apos;s event titles
                        </span>
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="[Work] "
                          value={opts.prefix}
                          onChange={(e) => setFeedOpt(i, "prefix", e.target.value)}
                          data-testid={`source-prefix-${i}`}
                          aria-label={`Title prefix for source ${i + 1}`}
                          className="mt-1 w-full border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                      </label>

                      {/* Per-feed busy mask */}
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={opts.busyOnly}
                          onChange={(e) => setFeedOpt(i, "busyOnly", e.target.checked)}
                          data-testid={`source-busy-${i}`}
                          aria-label={`Mask this feed's titles for source ${i + 1}`}
                          className="mt-0.5 h-3.5 w-3.5 border-gray-300"
                        />
                        <span className="text-xs">
                          <span className="font-semibold">Mask this feed&apos;s titles</span>
                          <span className="block text-gray-500">
                            Show this feed&apos;s events as &ldquo;Busy&rdquo;, keeping other feeds detailed.
                          </span>
                        </span>
                      </label>

                      {/* Per-feed hide all-day */}
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={opts.hideAllDay}
                          onChange={(e) => setFeedOpt(i, "hideAllDay", e.target.checked)}
                          data-testid={`source-hide-allday-${i}`}
                          aria-label={`Hide all-day events for source ${i + 1}`}
                          className="mt-0.5 h-3.5 w-3.5 border-gray-300"
                        />
                        <span className="text-xs">
                          <span className="font-semibold">Hide all-day events from this feed</span>
                          <span className="block text-gray-500">
                            Drop birthdays/holidays and other all-day items from this feed.
                          </span>
                        </span>
                      </label>

                      {/* Per-feed keyword filters */}
                      <div>
                        <span className="text-xs font-semibold text-gray-600">
                          Keywords — this feed only
                        </span>
                        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                          <label className="flex-1">
                            <span className="text-xs text-gray-500">Include</span>
                            <input
                              type="text"
                              placeholder="piano, soccer"
                              value={opts.include}
                              onChange={(e) => setFeedOpt(i, "include", e.target.value)}
                              data-testid={`source-include-${i}`}
                              aria-label={`Per-feed include keyword for source ${i + 1}`}
                              className="mt-0.5 w-full border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                            />
                          </label>
                          <label className="flex-1">
                            <span className="text-xs text-gray-500">Exclude</span>
                            <input
                              type="text"
                              placeholder="standup, lunch"
                              value={opts.exclude}
                              onChange={(e) => setFeedOpt(i, "exclude", e.target.value)}
                              data-testid={`source-exclude-${i}`}
                              aria-label={`Per-feed exclude keyword for source ${i + 1}`}
                              className="mt-0.5 w-full border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                            />
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          Only this feed&apos;s events are filtered. These ADD to the global
                          keyword filters above — an event must pass both.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {sources.length < 5 && (
            <button
              type="button"
              data-testid="add-source"
              onClick={addSource}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
            >
              + Add another source
            </button>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold">Only include events containing</span>
            <input
              type="text"
              value={include}
              onChange={(e) => setInclude(e.target.value)}
              placeholder="e.g. piano"
              data-testid="include-filter"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Exclude events containing</span>
            <input
              type="text"
              value={exclude}
              onChange={(e) => setExclude(e.target.value)}
              placeholder="e.g. standup"
              data-testid="exclude-filter"
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>
        <p className="-mt-4 text-xs text-gray-500">
          Keywords match event titles, case-insensitively. Leave blank to keep
          everything.{" "}
          <span className="text-gray-400">
            Applies to all feeds. Want different keywords per feed? Use that feed&apos;s Options &amp; filters.
          </span>
        </p>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={busyOnly}
            onChange={(e) => setBusyOnly(e.target.checked)}
            data-testid="busy-only"
            className="mt-0.5 h-4 w-4 border-gray-300"
          />
          <span>
            <span className="font-semibold">Busy-only privacy mask</span>
            <span className="block text-gray-500">
              Every event title becomes &ldquo;Busy&rdquo;; descriptions,
              locations and attendees are stripped. Times are kept.
            </span>
            <span className="block text-gray-400 text-xs mt-0.5">
              Applies to all feeds. Need it for just one? Use a feed&apos;s Options &amp; filters.
            </span>
          </span>
        </label>

        {/* ── Preview merged calendar — primary pre-create action ── */}
        <div className="space-y-2">
          {!hasAnySources() && (
            <p
              role="status"
              data-testid="preview-disabled-hint"
              className="text-xs text-gray-400"
            >
              Add a feed URL to preview.
            </p>
          )}
          <button
            type="button"
            data-testid="preview-btn"
            disabled={!previewCanRun}
            aria-busy={previewLoading}
            onClick={() => runPreview()}
            className="w-full border border-gray-400 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-default"
            style={{ minHeight: "44px" }}
          >
            {previewLoading ? "Fetching…" : "Preview merged calendar"}
          </button>

          {previewError && (
            <p role="alert" data-testid="preview-error" className="text-sm text-red-600">
              {previewError}
            </p>
          )}

          {/* Preview panel — shown after Preview click (pre-create) and after Create */}
          {(previewData || previewLoading) && !feedUrl && (
            <PreviewPanel data={previewData} loading={previewLoading} />
          )}
        </div>

        {/* ── Create feed — secondary action ── */}
        <button
          type="submit"
          disabled={working}
          data-testid="create-feed"
          aria-busy={working}
          className="inline-flex w-full items-center justify-center gap-2 border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 sm:w-auto"
        >
          {working && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {working ? "Creating…" : "Create feed"}
        </button>

        {error && (
          <p role="alert" data-testid="form-error" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {feedUrl && webcalUrl && result && (
        <section data-testid="result" className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold">Your merged feed</h2>

          {/* Confirmation banner */}
          <div
            role="status"
            data-testid="confirmation-banner"
            className="border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
          >
            {result.applied.sourceCount === 1 ? (
              <span>
                Built from <strong>1 source</strong> — add more anytime.{" "}
                {result.totalEventCount > 0 && (
                  <>{result.totalEventCount} event{result.totalEventCount !== 1 ? "s" : ""} at blend time.</>
                )}
              </span>
            ) : (
              <span>
                <strong>{result.totalEventCount}</strong> event
                {result.totalEventCount !== 1 ? "s" : ""} from{" "}
                <strong>{result.applied.sourceCount - result.failedSources.length}</strong>{" "}
                source{result.applied.sourceCount - result.failedSources.length !== 1 ? "s" : ""} at blend time.{" "}
                <span className="text-gray-500 font-normal">The live feed auto-refreshes.</span>
              </span>
            )}
            {result.applied.include && (
              <span className="ml-1">Only events matching &ldquo;{result.applied.include}&rdquo;.</span>
            )}
            {result.applied.exclude && (
              <span className="ml-1">Excluding &ldquo;{result.applied.exclude}&rdquo;.</span>
            )}
            {result.applied.busyOnly && (
              <span className="ml-1">Busy-only mask on.</span>
            )}
            {(result.applied.feedsLabelled ?? 0) > 0 && (
              <span className="ml-1">
                {result.applied.feedsLabelled} feed{result.applied.feedsLabelled !== 1 ? "s" : ""} labelled.
              </span>
            )}
            {(result.applied.feedsMasked ?? 0) > 0 && (
              <span className="ml-1">
                {result.applied.feedsMasked} feed{result.applied.feedsMasked !== 1 ? "s" : ""} masked.
              </span>
            )}
          </div>

          {/* Per-source failures at create time */}
          {result.failedSources.length > 0 && (
            <div
              role="alert"
              data-testid="create-failures"
              className="border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <p className="font-semibold mb-1">
                {result.failedSources.length === 1 ? "1 source" : `${result.failedSources.length} sources`} could not be fetched
              </p>
              <ul className="space-y-0.5">
                {result.failedSources.map((idx) => {
                  const reason = result.failedReasons?.[idx];
                  return (
                    <li key={idx}>
                      Feed {idx}{reason ? ` — ${reason}` : ""}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-gray-500">
                Events from the remaining sources are included. The feed will retry on each refresh.
              </p>
            </div>
          )}

          {/* Google Calendar one-tap */}
          <a
            href={`https://www.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="add-to-google"
            className="flex w-full items-center justify-center gap-2 border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 sm:w-auto"
          >
            Add to Google Calendar
          </a>

          {/* Copy URLs */}
          <p className="text-xs text-gray-500" data-testid="subscribe-caption">
            Your private subscribe link — paste it into Google Calendar, Apple Calendar, or Outlook to subscribe. Anyone with this link can read your merged calendar; treat it like a password.
          </p>
          <div className="space-y-3 border border-gray-200 bg-gray-50 p-4">
            {(
              [
                { label: "Feed URL (https://)", url: feedUrl, which: "https" as const, testid: "feed-url" },
                { label: "webcal:// URL", url: webcalUrl, which: "webcal" as const, testid: "webcal-url" },
              ]
            ).map(({ label, url, which, testid }) => (
              <div key={which}>
                <div className="text-xs font-semibold text-gray-500">{label}</div>
                <div className="mt-1 flex items-center gap-2">
                  <code
                    data-testid={testid}
                    className="block flex-1 overflow-x-auto whitespace-nowrap bg-white px-2 py-1.5 text-xs text-gray-800 ring-1 ring-gray-200"
                  >
                    {url}
                  </code>
                  <button
                    type="button"
                    data-testid={`copy-${which}`}
                    aria-label={`Copy ${label}`}
                    onClick={() => copy(url, which)}
                    className="shrink-0 border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                  >
                    {copied === which ? "Copied!" : "Copy"}
                  </button>
                </div>
                {copied === which && (
                  <p role="status" className="mt-0.5 text-xs text-gray-600">
                    Copied to clipboard
                  </p>
                )}
              </div>
            ))}
            <p className="mt-1 text-xs text-gray-500" data-testid="privacy-note">
              No account, no database. Your config (including source URLs) is encrypted into
              this link. On each calendar refresh, our server decrypts the link and fetches
              your feeds to merge them — the URLs are never stored persistently, but they do
              transit the server. Lose the link? Just build a new one.
            </p>
          </div>

          {/* Subscribe instructions */}
          <div className="border border-gray-200 p-4 text-sm text-gray-700">
            <h3 className="font-semibold">Subscribe in your calendar app</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">Google Calendar:</span>{" "}
                Other calendars → + → &ldquo;From URL&rdquo; → paste the Feed
                URL. Or use the button above.
              </li>
              <li>
                <span className="font-medium">Apple Calendar:</span> open the
                webcal:// link, or File → New Calendar Subscription → paste it.
              </li>
              <li>
                <span className="font-medium">Outlook / Office 365:</span> In
                Outlook on the web, go to Calendar → Add calendar → Subscribe
                from web → paste the Feed URL.
              </li>
            </ul>
          </div>

          {/* Post-create event preview — same PreviewPanel component */}
          <div className="border border-gray-200 p-4">
            <h3 className="text-sm font-semibold">
              Preview — exactly what subscribers see
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Masks, labels, and filters are already applied below — this is the real output.
            </p>
            {result && (
              <p className="mt-1 text-xs text-gray-500" data-testid="preview-applied">
                {result.applied.sourceCount} source{result.applied.sourceCount !== 1 ? "s" : ""}
                {result.applied.include && ` · only "${result.applied.include}"`}
                {result.applied.exclude && ` · excluding "${result.applied.exclude}"`}
                {result.applied.busyOnly && " · busy-only mask on"}
                {(result.applied.feedsLabelled ?? 0) > 0 && ` · ${result.applied.feedsLabelled} feed${result.applied.feedsLabelled !== 1 ? "s" : ""} labelled`}
                {(result.applied.feedsMasked ?? 0) > 0 && ` · ${result.applied.feedsMasked} feed${result.applied.feedsMasked !== 1 ? "s" : ""} masked`}
              </p>
            )}
            {result.previewEvents.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No upcoming events matched. Check your filters or source URLs.
              </p>
            )}
            {result.previewEvents.length > 0 && (
              <ul data-testid="preview-list" className="mt-3 divide-y divide-gray-100">
                {result.previewEvents.map((ev, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
                  >
                    <span className="truncate font-medium">{ev.summary}</span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatStart(ev)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Recent blends — device-local, loaded after mount */}
      {recentBlends.length > 0 && (
        <section className="mt-10" data-testid="recent-blends">
          <h2 className="text-sm font-semibold text-gray-700">Your recent blends</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Saved on this device only. Edit the nickname to remember which link is which.
          </p>
          <ul className="mt-3 divide-y divide-gray-100 border border-gray-200">
            {recentBlends.map((blend, idx) => {
              const defaultLabel = (() => {
                try { return `Blend from ${new URL(blend.url).hostname}`; } catch { return `Blend ${idx + 1}`; }
              })();
              return (
                <li
                  key={blend.url}
                  className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div className="min-w-0 flex-1">
                    {/* Nickname as primary heading (editable) */}
                    <input
                      type="text"
                      aria-label={`Nickname for blend ${idx + 1}`}
                      data-testid={`recent-nickname-${idx}`}
                      placeholder={`Add a nickname — e.g. ${defaultLabel}`}
                      value={blend.nickname}
                      maxLength={60}
                      onChange={(e) => {
                        const nn = e.target.value;
                        updateRecentNickname(blend.url, nn);
                        setRecentBlends((prev) =>
                          prev.map((b, j) => (j === idx ? { ...b, nickname: nn } : b))
                        );
                      }}
                      className="w-full border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    {/* URL as secondary, faint */}
                    <div className="mt-0.5 truncate text-xs text-gray-400" data-testid={`recent-url-${idx}`}>{blend.url}</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={`Copy feed URL for blend ${idx + 1}`}
                      data-testid={`recent-copy-${idx}`}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(blend.url);
                          setRecentCopied(idx);
                          if (recentCopyTimer.current) clearTimeout(recentCopyTimer.current);
                          recentCopyTimer.current = setTimeout(() => setRecentCopied(null), 2000);
                        } catch {
                          // Clipboard unavailable.
                        }
                      }}
                      className="border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Copy URL
                    </button>
                    {recentCopied === idx && (
                      <p role="status" data-testid={`recent-copied-${idx}`} className="text-xs text-gray-600">
                        Copied!
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="mt-12 text-xs text-gray-400">
        No account, no database. Your source URLs are encrypted into the feed link and
        fetched server-side on each refresh — never stored persistently.
      </footer>
    </main>
  );
}
