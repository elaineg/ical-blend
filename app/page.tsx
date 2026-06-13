"use client";

import { useRef, useState } from "react";

interface PreviewEvent {
  summary: string;
  start: string | null;
  allDay: boolean;
}

interface CreateResult {
  feedPath: string;
  failedSources: number[];
  totalEventCount: number;
  previewEvents: PreviewEvent[];
  applied: {
    include: string | null;
    exclude: string | null;
    busyOnly: boolean;
    sourceCount: number;
  };
}

interface FieldError {
  index: number;
  message: string;
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

const EXAMPLE_URL = "https://www.googleapis.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics";

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

export default function Home() {
  const [sources, setSources] = useState<string[]>([EXAMPLE_URL, ""]);
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

  const webcalUrl = feedUrl ? feedUrl.replace(/^https?:\/\//, "webcal://") : null;

  function setSource(i: number, value: string) {
    setSources((prev) => prev.map((s, j) => (j === i ? value : s)));
    // Clear field error for this index when the user edits.
    setFieldErrors((prev) => prev.filter((e) => e.index !== i));
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

  async function createFeed(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setFeedUrl(null);
    setResult(null);

    const filledSources = sources.map((s) => s.trim()).filter((s) => s.length > 0);

    // Client-side validation.
    if (filledSources.length === 0) {
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

    setWorking(true);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: filledSources,
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
      setResult({
        feedPath: data.feedPath,
        failedSources: data.failedSources ?? [],
        totalEventCount: data.totalEventCount ?? 0,
        previewEvents: data.previewEvents ?? [],
        applied: data.applied ?? {
          include: null,
          exclude: null,
          busyOnly: false,
          sourceCount: filledSources.length,
        },
      });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setWorking(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const inputErrorClass =
    "w-full rounded-md border border-red-400 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Stop checking three calendars
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Paste 2–5 calendar links. Get one feed. No account.{" "}
        Blend your work, personal, and shared calendars into one link you
        subscribe to once — and hand others a version with the private titles
        hidden.
      </p>

      <form onSubmit={createFeed} className="mt-8 space-y-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">
            Source feeds (ICS / webcal URLs)
          </legend>
          {sources.map((s, i) => {
            const fieldError = fieldErrors.find((e) => e.index === i);
            return (
              <div key={i}>
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
                      onClick={() => {
                        setSources((prev) => prev.filter((_, j) => j !== i));
                        setFieldErrors((prev) => prev.filter((e) => e.index !== i));
                      }}
                      className="rounded-md border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
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
              </div>
            );
          })}
          {sources.length < 5 && (
            <button
              type="button"
              data-testid="add-source"
              onClick={() => setSources((prev) => [...prev, ""])}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
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
          everything.
        </p>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={busyOnly}
            onChange={(e) => setBusyOnly(e.target.checked)}
            data-testid="busy-only"
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span>
            <span className="font-semibold">Busy-only privacy mask</span>
            <span className="block text-gray-500">
              Every event title becomes &ldquo;Busy&rdquo;; descriptions,
              locations and attendees are stripped. Times are kept.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={working}
          data-testid="create-feed"
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
        >
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
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {result.applied.sourceCount === 1 ? (
              <span>
                Built from <strong>1 source</strong> — add more anytime.{" "}
                {result.totalEventCount > 0 && (
                  <>{result.totalEventCount} event{result.totalEventCount !== 1 ? "s" : ""} merged.</>
                )}
              </span>
            ) : (
              <span>
                Merged <strong>{result.totalEventCount}</strong> event
                {result.totalEventCount !== 1 ? "s" : ""} from{" "}
                <strong>{result.applied.sourceCount - result.failedSources.length}</strong>{" "}
                source{result.applied.sourceCount - result.failedSources.length !== 1 ? "s" : ""}.
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
          </div>

          {/* Per-source failures at create time */}
          {result.failedSources.length > 0 && (
            <div
              role="alert"
              data-testid="create-failures"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <strong>
                Source{result.failedSources.length > 1 ? "s" : ""}{" "}
                {result.failedSources.join(", ")} could not be fetched
              </strong>{" "}
              — events from the remaining sources are included. The feed will
              retry those sources each time it refreshes.
            </div>
          )}

          {/* Google Calendar one-tap */}
          <a
            href={`https://www.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="add-to-google"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
          >
            Add to Google Calendar
          </a>

          {/* Copy URLs */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                    className="block flex-1 overflow-x-auto whitespace-nowrap rounded bg-white px-2 py-1.5 text-xs text-gray-800 ring-1 ring-gray-200"
                  >
                    {url}
                  </code>
                  <button
                    type="button"
                    data-testid={`copy-${which}`}
                    aria-label={`Copy ${label}`}
                    onClick={() => copy(url, which)}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                  >
                    {copied === which ? "Copied!" : "Copy"}
                  </button>
                </div>
                {copied === which && (
                  <p role="status" className="mt-0.5 text-xs text-green-600">
                    Copied to clipboard
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Subscribe instructions */}
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
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

          {/* Event preview */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold">Preview — upcoming events</h3>
            {result && (
              <p className="mt-1 text-xs text-gray-500" data-testid="preview-applied">
                {result.applied.sourceCount} source{result.applied.sourceCount !== 1 ? "s" : ""}
                {result.applied.include && ` · only "${result.applied.include}"`}
                {result.applied.exclude && ` · excluding "${result.applied.exclude}"`}
                {result.applied.busyOnly && " · busy-only mask on"}
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

      <footer className="mt-12 text-xs text-gray-400">
        Nothing is stored on the server — the feed URL itself carries your
        encrypted configuration. Lose the URL? Just build a new one.
      </footer>
    </main>
  );
}
