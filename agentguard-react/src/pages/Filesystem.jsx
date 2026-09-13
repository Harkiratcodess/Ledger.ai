import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "CREATE", label: "CREATE" },
  { id: "MODIFY", label: "MODIFY" },
  { id: "DELETE", label: "DELETE" },
  { id: "sensitive", label: "SENSITIVE" },
];

const OPERATION_MAP = {
  created: "CREATE",
  changed: "MODIFY",
  deleted: "DELETE",
};

const EMPTY_FIELD = "—";

function formatTimestamp(value) {
  if (!value) return EMPTY_FIELD;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_FIELD;

  const formatted = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formatted.replace(",", "").trim();
}

function normalizeEvent(rawEvent) {
  return {
    id: rawEvent?._id || rawEvent?.id || "unknown",
    timestamp: formatTimestamp(rawEvent?.timestamp),
    operation: OPERATION_MAP[rawEvent?.action] || rawEvent?.action?.toUpperCase() || EMPTY_FIELD,
    path: rawEvent?.path || EMPTY_FIELD,
    process: EMPTY_FIELD,
    pid: null,
    sizeDelta: EMPTY_FIELD,
    sensitive: false,
    blocked: false,
    integrity: EMPTY_FIELD,
  };
}

export default function Filesystem() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);
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
      const nextEvents = Array.isArray(payload?.events) ? payload.events.map(normalizeEvent) : [];
      setEvents(nextEvents);
    } catch (err) {
      setError(err.message || "Unable to load backend filesystem events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const counts = useMemo(
    () => ({
      all: events.length,
      CREATE: events.filter((e) => e.operation === "CREATE").length,
      MODIFY: events.filter((e) => e.operation === "MODIFY").length,
      DELETE: events.filter((e) => e.operation === "DELETE").length,
      sensitive: 0,
    }),
    [events]
  );

  const rows = useMemo(() => {
    return events.filter((e) => {
      if (filter === "sensitive") return false;
      if (filter !== "all" && filter !== "sensitive" && e.operation !== filter) return false;
      if (query && !e.path.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [events, filter, query]);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest p-space-md flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-highest">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
              <span>SUBSYSTEM: VFS-WATCHER</span>
              <span>//</span>
              <span className="text-primary-container">LIVE AUDIT STREAM</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
              FILESYSTEM <span className="text-on-surface-variant font-headline-lg text-headline-lg">ACTIVITY MONITOR</span>
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider mt-1">
              Chronological audit trail (live backend filesystem events)
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
            ["CREATED", counts.CREATE],
            ["MODIFIED", counts.MODIFY],
            ["DELETED", counts.DELETE],
          ].map(([label, value]) => (
            <div key={label} className="p-space-md bg-surface-container-low border-r border-b lg:border-b-0 border-surface-container-highest">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</span>
              <div className="font-headline-xl text-headline-xl text-primary font-bold mt-space-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="w-full bg-surface-container-lowest border-b border-surface-container-highest p-space-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-px bg-surface-container-highest border border-surface-container-highest" role="tablist">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`px-space-md py-1.5 font-label-md text-label-md tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-primary-container ${
                    active
                      ? "bg-surface-container-lowest text-primary-container border-l-2 border-primary-container"
                      : "bg-surface-container-low text-outline hover:text-on-surface"
                  }`}
                >
                  {f.label} ({counts[f.id] ?? counts.all})
                </button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-space-sm">
            <label htmlFor="path-search-input" className="sr-only">
              Search path
            </label>
            <input
              id="path-search-input"
              className="w-full sm:w-80 bg-surface-container-lowest border border-surface-container-highest px-space-md py-1.5 text-on-surface font-code-dense text-code-dense uppercase focus:outline-none focus:border-primary-container placeholder:text-outline"
              placeholder="SEARCH PATH..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                setToast(true);
                setTimeout(() => setToast(false), 2000);
              }}
              className="border border-surface-container-highest px-space-md py-1.5 font-label-md text-label-md uppercase hover:bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary-container"
            >
              [ EXPORT TSV ]
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="w-full p-space-xl">
              <LoadingState label="LOADING FILESYSTEM EVENTS..." />
            </div>
          ) : error ? (
            <div className="w-full p-space-xl">
              <ErrorState title="EVENT LOAD FAILED" message={error} onRetry={loadEvents} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed min-w-[960px]">
              <thead className="bg-surface-container-low border-b border-surface-container-highest">
                <tr className="font-headline-sm text-[11px] text-outline uppercase tracking-wider">
                  <th className="w-36 py-2 px-space-md border-r border-surface-container-highest">TIMESTAMP</th>
                  <th className="w-28 py-2 px-space-md border-r border-surface-container-highest">OPERATION</th>
                  <th className="py-2 px-space-md border-r border-surface-container-highest">PATH</th>
                  <th className="w-28 py-2 px-space-md border-r border-surface-container-highest text-right">SIZE DELTA</th>
                  <th className="w-56 py-2 px-space-md border-r border-surface-container-highest">PROCESS</th>
                  <th className="w-28 py-2 px-space-md text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {rows.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => navigate(`/event/${evt.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/event/${evt.id}`);
                      }
                    }}
                    tabIndex={0}
                    className={`group hover:bg-surface-container cursor-pointer focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-inset focus:ring-primary-container ${
                      evt.sensitive ? "bg-surface-container-low" : ""
                    }`}
                  >
                    <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
                      {evt.timestamp}
                    </td>
                    <td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold">
                      <span
                        className={`inline-block px-1 py-0.5 border ${
                          evt.sensitive
                            ? "border-secondary-container text-secondary"
                            : evt.operation === "CREATE"
                              ? "border-primary-container/40 text-primary-container"
                              : evt.operation === "DELETE"
                                ? "border-secondary-container text-secondary"
                                : "border-surface-container-highest text-on-surface"
                        }`}
                      >
                        {evt.operation}
                      </span>
                    </td>
                    <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense">
                      <div className="flex items-center gap-space-sm truncate">
                        <span className={`truncate ${evt.sensitive ? "text-secondary font-bold" : "text-on-surface"}`}>{evt.path}</span>
                        {evt.sensitive && (
                          <span className="border border-secondary px-1 text-[9px] text-secondary uppercase font-bold shrink-0">
                            METADATA ONLY
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense">
                      {evt.sizeDelta}
                    </td>
                    <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
                      {evt.process}
                      {evt.pid !== null && evt.pid !== undefined && (
                        <span className="text-outline text-[9px] ml-1">[PID:{evt.pid}]</span>
                      )}
                    </td>
                    <td className="py-2 px-space-md text-center" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/event/${evt.id}`}
                        className="inline-block border border-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm uppercase hover:border-primary-container hover:text-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                      >
                        [INSPECT]
                      </Link>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-space-md py-space-xl text-center font-label-md text-label-md text-outline uppercase">
                      NO EVENTS MATCH FILTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && (
          <div className="w-full bg-surface-container-low border-t border-surface-container-highest p-space-sm font-code-dense text-code-dense text-on-surface-variant">
            SHOWING {rows.length} OF {events.length} BACKEND EVENTS · SENSITIVE PATHS: NOT DETECTED
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 bg-surface-container-lowest border border-primary-container p-space-md z-50" role="status">
            <span className="font-bold text-primary-container uppercase font-code-dense text-code-dense block">EXPORT READY</span>
            <span className="font-code-dense text-code-dense text-on-surface">No file written from this UI</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
