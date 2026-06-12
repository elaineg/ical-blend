"use client";

import { useRef, useState } from "react";

interface PreviewEvent {
  summary: string;
  start: string | null;
  allDay: boolean;
}

interface PreviewData {
  events: PreviewEvent[];
  failedSources: number[];
  applied: {
    include: string | null;
    exclude: string | null;
    busyOnly: boolean;
    sourceCount: number;
  };
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

export default function Home() {
  const [sources, setSources] = useState<string[]>(["", ""]);
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [busyOnly, setBusyOnly] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState<"https" | "webcal" | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const webcalUrl = feedUrl ? feedUrl.replace(/^https?:\/\//, "webcal://") : null;

  function setSource(i: number, value: string) {
    setSources((prev) => prev.map((s, j) => (j === i ? value : s)));
  }

  async function copy(text: string, which: "https" | "webcal") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard unavailable; the URL is selectable text anyway.
    }
  }

  async function createFeed(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedUrl(null);
    setPreview(null);
    setWorking(true);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: sources.filter((s) => s.trim().length > 0),
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
      setPreviewLoading(true);
      try {
        const pRes = await fetch(`${data.feedPath}?preview=json`);
        if (pRes.ok) setPreview(await pRes.json());
      } finally {
        setPreviewLoading(false);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setWorking(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">iCal Blend</h1>
      <p className="mt-2 text-sm text-gray-600">
        Merge 2–5 calendar feed URLs into one subscribable feed — with optional
        keyword filters and a busy-only privacy mask. No account, nothing
        stored: your whole setup lives encrypted inside the URL.
      </p>

      <form onSubmit={createFeed} className="mt-8 space-y-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">
            Source feeds (ICS / webcal URLs)
          </legend>
          {sources.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                inputMode="url"
                required={i < 2}
                placeholder={`https://example.com/calendar-${i + 1}.ics`}
                value={s}
                onChange={(e) => setSource(i, e.target.value)}
                data-testid={`source-${i}`}
                className={inputClass}
              />
              {sources.length > 2 && (
                <button
                  type="button"
                  aria-label={`Remove source ${i + 1}`}
                  onClick={() =>
                    setSources((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="rounded-md border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
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
          <p data-testid="form-error" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {feedUrl && webcalUrl && (
        <section data-testid="result" className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold">Your merged feed</h2>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {(
              [
                { label: "Feed URL", url: feedUrl, which: "https" as const, testid: "feed-url" },
                { label: "webcal://", url: webcalUrl, which: "webcal" as const, testid: "webcal-url" },
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
                    onClick={() => copy(url, which)}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                  >
                    {copied === which ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
            <h3 className="font-semibold">Subscribe</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Google Calendar:</span> Other
                calendars → + → &ldquo;From URL&rdquo; → paste the feed URL.
              </li>
              <li>
                <span className="font-medium">Apple Calendar:</span> open the
                webcal:// link, or File → New Calendar Subscription → paste it.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold">Preview — upcoming events</h3>
            {preview && (
              <p className="mt-1 text-xs text-gray-500" data-testid="preview-applied">
                {preview.applied.sourceCount} sources
                {preview.applied.include && ` · only "${preview.applied.include}"`}
                {preview.applied.exclude && ` · excluding "${preview.applied.exclude}"`}
                {preview.applied.busyOnly && " · busy-only mask on"}
              </p>
            )}
            {previewLoading && (
              <p className="mt-2 text-sm text-gray-500">Loading preview…</p>
            )}
            {preview && preview.failedSources.length > 0 && (
              <p className="mt-2 text-sm text-amber-700" data-testid="preview-warning">
                Source{preview.failedSources.length > 1 ? "s" : ""}{" "}
                {preview.failedSources.join(", ")} could not be fetched — the
                feed still works with the rest.
              </p>
            )}
            {preview && preview.events.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No upcoming events matched. Check your filters.
              </p>
            )}
            {preview && preview.events.length > 0 && (
              <ul data-testid="preview-list" className="mt-3 divide-y divide-gray-100">
                {preview.events.map((ev, i) => (
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
