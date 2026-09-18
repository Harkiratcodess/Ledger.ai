import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FIELD = "—";

function formatTimestamp(value) {
  if (!value) return EMPTY_FIELD;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_FIELD;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(",", "").trim();
}

function normalizeEvent(rawEvent) {
  return {
    id: rawEvent?._id || rawEvent?.id || "unknown",
    hostname: rawEvent?.hostname || EMPTY_FIELD,
    method: rawEvent?.method || EMPTY_FIELD,
    url: rawEvent?.url || EMPTY_FIELD,
    statusCode: rawEvent?.statusCode !== undefined && rawEvent?.statusCode !== null ? String(rawEvent.statusCode) : EMPTY_FIELD,
    timestamp: formatTimestamp(rawEvent?.timestamp),
    process: EMPTY_FIELD,
    pid: EMPTY_FIELD,
    risk: EMPTY_FIELD,
    bytes: EMPTY_FIELD,
  };
}

export default function Network() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/events");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const nextEvents = Array.isArray(payload?.events)
        ? payload.events.filter((event) => event?.type === "network").map(normalizeEvent)
        : [];

      setEvents(nextEvents);
    } catch (err) {
      setError(err.message || "Unable to load network events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filters = useMemo(() => {
    const base = ["all"];
    events.forEach((event) => {
      if (event.method && event.method !== "—" && !base.includes(event.method)) {
        base.push(event.method);
      }
    });
    return base;
  }, [events]);

  const counts = useMemo(
    () => ({
      all: events.length,
      ...Object.fromEntries(
        filters.filter((name) => name !== "all").map((name) => [name, events.filter((event) => event.method === name).length])
      ),
    }),
    [events, filters]
  );

  const rows = useMemo(() => {
    return events.filter((event) => {
      if (filter !== "all" && event.method !== filter) return false;
      if (query && !`${event.hostname} ${event.url}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [events, filter, query]);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest p-space-md flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-highest">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
              <span>SUBSYSTEM: MITMPROXY</span>
              <span>//</span>
              <span className="text-primary-container">LIVE NETWORK STREAM</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
              NETWORK <span className="text-on-surface-variant font-headline-lg text-headline-lg">EVENTS</span>
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider mt-1">
              Local HTTP metadata captured from the Ledger security proxy
            </p>
          </div>
          <div className="flex items-center gap-space-lg bg-surface-container p-space-sm border border-surface-container-highest">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">RECORDS</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">{events.length} TOTAL</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 w-full border-b border-surface-container-highest">
          {[
            ["TOTAL EVENTS", counts.all],
            ["GET", counts.GET ?? 0],
            ["POST", counts.POST ?? 0],
            ["STATUS 200", events.filter((event) => event.statusCode === "200").length],
          ].map(([label, value]) => (
            <div key={label} className="p-space-md bg-surface-container-low border-r border-b lg:border-b-0 border-surface-container-highest">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</span>
              <div className="font-headline-xl text-headline-xl text-primary font-bold mt-space-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="w-full bg-surface-container-lowest border-b border-surface-container-highest p-space-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-px bg-surface-container-highest border border-surface-container-highest" role="tablist">
            {filters.map((method) => {
              const active = filter === method;
              const label = method === "all" ? "ALL" : method;
              return (
                <button
                  key={method}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(method)}
                  className={`px-space-md py-1.5 font-label-md text-label-md tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-primary-container ${
                    active
                      ? "bg-surface-container-lowest text-primary-container border-l-2 border-primary-container"
                      : "bg-surface-container-low text-outline hover:text-on-surface"
                  }`}
                >
                  {label} ({counts[method] ?? 0})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-space-sm">
            <label htmlFor="network-search-input" className="sr-only">
              Search network events
            </label>
            <input
              id="network-search-input"
              className="w-full sm:w-80 bg-surface-container-lowest border border-surface-container-highest px-space-md py-1.5 text-on-surface font-code-dense text-code-dense uppercase focus:outline-none focus:border-primary-container placeholder:text-outline"
              placeholder="SEARCH HOST / URL..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="w-full p-space-xl">
              <LoadingState label="LOADING NETWORK EVENTS..." />
            </div>
          ) : error ? (
            <div className="w-full p-space-xl">
              <ErrorState title="NETWORK EVENT LOAD FAILED" message={error} onRetry={loadEvents} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed min-w-[980px]">
              <thead className="bg-surface-container-low border-b border-surface-container-highest">
                <tr className="font-headline-sm text-[11px] text-outline uppercase tracking-wider">
                  <th className="w-36 py-2 px-space-md border-r border-surface-container-highest">TIMESTAMP</th>
                  <th className="w-28 py-2 px-space-md border-r border-surface-container-highest">METHOD</th>
                  <th className="w-40 py-2 px-space-md border-r border-surface-container-highest">HOSTNAME</th>
                  <th className="py-2 px-space-md border-r border-surface-container-highest">URL</th>
                  <th className="w-28 py-2 px-space-md border-r border-surface-container-highest text-right">STATUS</th>
                  <th className="w-28 py-2 px-space-md text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {rows.map((evt) => {
                  const statusClass =
                    evt.statusCode.startsWith("2")
                      ? "border-primary-container/40 text-primary-container"
                      : evt.statusCode.startsWith("3")
                        ? "border-secondary-container text-secondary"
                        : evt.statusCode.startsWith("4") || evt.statusCode.startsWith("5")
                          ? "border-error-container text-error"
                          : "border-surface-container-highest text-on-surface";

                  return (
                    <tr key={evt.id} className="hover:bg-surface-container">
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
                        {evt.timestamp}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold">
                        <span className="inline-block px-1 py-0.5 border border-surface-container-highest text-on-surface">
                          {evt.method}
                        </span>
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface truncate">
                        {evt.hostname}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
                        {evt.url}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense">
                        <span className={`inline-block px-1 py-0.5 border ${statusClass}`}>
                          {evt.statusCode}
                        </span>
                      </td>
                      <td className="py-2 px-space-md text-center font-label-sm text-label-sm uppercase text-outline">
                        {evt.method === "—" ? "—" : "OBSERVED"}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-space-md py-space-xl text-center font-label-md text-label-md text-outline uppercase">
                      NO NETWORK EVENTS MATCH FILTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && (
          <div className="w-full bg-surface-container-low border-t border-surface-container-highest p-space-sm font-code-dense text-code-dense text-on-surface-variant">
            SHOWING {rows.length} OF {events.length} BACKEND EVENTS · NO BODY CONTENT CAPTURED
          </div>
        )}
      </div>
    </Layout>
  );
}
