import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { MOCK_EVENTS } from "../mock/events";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "CREATE", label: "CREATE" },
  { id: "MODIFY", label: "MODIFY" },
  { id: "DELETE", label: "DELETE" },
  { id: "sensitive", label: "SENSITIVE" },
];

export default function Filesystem() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);

  const counts = useMemo(
    () => ({
      all: MOCK_EVENTS.length,
      CREATE: MOCK_EVENTS.filter((e) => e.operation === "CREATE").length,
      MODIFY: MOCK_EVENTS.filter((e) => e.operation === "MODIFY").length,
      DELETE: MOCK_EVENTS.filter((e) => e.operation === "DELETE").length,
      sensitive: MOCK_EVENTS.filter((e) => e.sensitive).length,
    }),
    []
  );

  const rows = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      if (filter === "sensitive" && !e.sensitive) return false;
      if (filter !== "all" && filter !== "sensitive" && e.operation !== filter) return false;
      if (query && !e.path.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest p-space-md flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-highest">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
              <span>SUBSYSTEM: VFS-WATCHER</span>
              <span>//</span>
              <span className="text-primary-container">MOCK AUDIT STREAM</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
              FILESYSTEM <span className="text-on-surface-variant font-headline-lg text-headline-lg">ACTIVITY MONITOR</span>
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider mt-1">
              Chronological audit trail (mock data — no real watcher)
            </p>
          </div>
          <div className="flex items-center gap-space-lg bg-surface-container p-space-sm border border-surface-container-highest">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">RECORDS</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">{MOCK_EVENTS.length} MOCK</span>
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
              [ EXPORT TSV ] MOCK
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
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
                    <span className="text-outline text-[9px] ml-1">[PID:{evt.pid}]</span>
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
        </div>

        <div className="w-full bg-surface-container-low border-t border-surface-container-highest p-space-sm font-code-dense text-code-dense text-on-surface-variant">
          SHOWING {rows.length} OF {MOCK_EVENTS.length} MOCK EVENTS · SENSITIVE PATHS: METADATA ONLY
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-surface-container-lowest border border-primary-container p-space-md z-50" role="status">
            <span className="font-bold text-primary-container uppercase font-code-dense text-code-dense block">EXPORT SIMULATED</span>
            <span className="font-code-dense text-code-dense text-on-surface">UI mock only — no file written</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
