import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ErrorState from "../components/ErrorState";
import { getSessionById } from "../mock/sessions";
import { MOCK_EVENTS } from "../mock/events";

function normalizeLiveEvent(event) {
  return {
    id: event?._id || event?.id,
    timestamp: event?.timestamp ? new Date(event.timestamp).toLocaleTimeString("en-GB", { hour12: false }) : "—",
    operation: event?.action?.toUpperCase() || event?.type?.toUpperCase() || "EVENT",
    path: event?.path || event?.url || event?.hostname || "—",
    process: event?.type || "event",
    pid: "—",
    sensitive: event?.riskLevel === "HIGH" || event?.riskLevel === "CRITICAL",
    integrity: `${event?.riskLevel || "LOW"} / SCORE ${event?.riskScore ?? "—"}`,
  };
}

export default function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiSession, setApiSession] = useState(null);
  const [opFilter, setOpFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [liveEvents, setLiveEvents] = useState(null);
  const mockSession = getSessionById(id);
  const session = apiSession || mockSession;

  useEffect(() => {
    let cancelled = false;
    fetch(`http://localhost:5000/api/sessions/${encodeURIComponent(id)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.session) {
          const runtimeSession = payload.session;
          setApiSession({
            id: runtimeSession.sessionId,
            status: runtimeSession.status,
            container: runtimeSession.containerId || "—",
            project: "sandbox-test",
            projectPath: "/workspace",
            events: "LIVE",
            startedFull: runtimeSession.startedAt || "—",
            duration: "—",
          });
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [id]);

  const events = useMemo(() => {
    const list = liveEvents || MOCK_EVENTS.filter((e) => e.sessionId === (session?.id || "AG-2026-001"));
    if (opFilter === "ALL") return list;
    return list.filter((e) => e.operation === opFilter);
  }, [liveEvents, session, opFilter]);

  useEffect(() => {
    let cancelled = false;
    fetch(`http://localhost:5000/api/sessions/${encodeURIComponent(id)}/events`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.events)) {
          setLiveEvents(payload.events.map(normalizeLiveEvent));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!session) {
    return (
      <Layout>
        <div className="p-space-xl">
          <ErrorState
            title="SESSION NOT FOUND"
            message={`No session exists for id "${id}". Start the runtime and protect a workspace first.`}
            onRetry={() => navigate("/sessions")}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-low border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <Link to="/sessions" className="font-label-sm text-label-sm text-outline uppercase hover:text-primary focus:outline-none focus:underline">
              ← SESSIONS
            </Link>
            <div className="flex items-baseline gap-space-md mt-space-xs flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">{session.id}</h1>
              <span className="font-label-md text-label-md text-primary-container px-space-xs py-[2px] border border-primary-container uppercase">
                {session.status}
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs">
              {apiSession ? "Live session from the local Ledger runtime" : "Session record not loaded from runtime"}
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-space-sm">
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await fetch("http://localhost:5000/api/sandbox/pause", { method: "POST" });
                  const payload = await response.json();
                  setToast(payload?.success ? "SANDBOX PAUSED" : payload?.error || "PAUSE FAILED");
                } catch (err) {
                  setToast(err.message);
                }
              }}
              className="h-9 px-space-md bg-surface border border-surface-container-highest text-on-surface font-label-md text-label-md hover:border-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
            >
              PAUSE SESSION
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await fetch("http://localhost:5000/api/sandbox/kill", { method: "POST" });
                  const payload = await response.json();
                  setToast(payload?.success ? "SANDBOX TERMINATED" : payload?.error || "KILL FAILED");
                } catch (err) {
                  setToast(err.message);
                }
              }}
              className="h-9 px-space-md border border-error-container text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error focus:outline-none focus:ring-1 focus:ring-error"
            >
              TERMINATE SESSION
            </button>
            <button
              type="button"
              onClick={() => setToast("Session JSON is available from GET /api/sessions/:id")}
              className="h-9 px-space-md bg-primary-container text-on-primary font-label-md text-label-md font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              EXPORT SESSION JSON
            </button>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-surface-container-highest">
          {[
            ["STATUS", session.status],
            ["CONTAINER", session.container],
            ["PROJECT", session.project],
            ["PROJECT PATH", session.projectPath],
            ["STARTED", session.startedFull || session.started],
            ["DURATION", session.duration],
          ].map(([label, value]) => (
            <div key={label} className="p-space-md border-r border-b lg:border-b-0 border-surface-container-highest bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{label}</span>
              <div className="font-body-lg text-body-lg text-primary font-bold mt-space-sm truncate">{value}</div>
            </div>
          ))}
        </div>

        <div className="w-full bg-surface-container-lowest border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-end justify-between gap-space-sm">
          <div>
            <h2 className="font-headline-lg text-headline-lg uppercase text-primary font-bold tracking-tight">SESSION ACTIVITY</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Filesystem operations for {session.id} · {session.events} total (mock)
            </p>
          </div>
          <div className="flex items-center bg-surface border border-surface-container-highest px-space-sm py-space-xs">
            <label htmlFor="op-filter" className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">
              FILTER:
            </label>
            <select
              id="op-filter"
              className="bg-transparent text-primary outline-none uppercase font-label-sm text-label-sm"
              value={opFilter}
              onChange={(e) => setOpFilter(e.target.value)}
            >
              <option value="ALL">ALL</option>
              <option value="CREATE">CREATE</option>
              <option value="MODIFY">MODIFY</option>
              <option value="DELETE">DELETE</option>
              <option value="ACCESS">ACCESS</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[860px]" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="h-8 bg-surface-container border-b border-surface-container-highest text-label-sm font-label-sm text-on-surface-variant uppercase">
                <th className="w-36 px-space-md border-r border-surface-container-highest">TIME</th>
                <th className="w-32 px-space-md border-r border-surface-container-highest">OPERATION</th>
                <th className="px-space-md border-r border-surface-container-highest">TARGET PATH</th>
                <th className="w-48 px-space-md border-r border-surface-container-highest">PROCESS</th>
                <th className="w-64 px-space-md">AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {events.map((evt) => (
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
                  className={`h-8 hover:bg-surface-container cursor-pointer focus:outline-none focus:bg-surface-container ${
                    evt.sensitive ? "bg-error-container/10" : ""
                  }`}
                >
                  <td className={`px-space-md border-r border-surface-container-highest font-code-dense text-code-dense ${evt.sensitive ? "text-error" : "text-outline"}`}>
                    {evt.timestamp}
                  </td>
                  <td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
                    <span className={`px-space-xs py-[2px] font-bold border ${evt.sensitive ? "border-error text-error" : "border-outline-variant text-primary"}`}>
                      {evt.operation}
                    </span>
                  </td>
                  <td className={`px-space-md border-r border-surface-container-highest font-code-dense text-code-dense truncate ${evt.sensitive ? "text-error font-bold" : "text-on-surface"}`}>
                    {evt.path}
                  </td>
                  <td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant">
                    {evt.process}[PID:{evt.pid}]
                  </td>
                  <td className={`px-space-md font-code-dense text-code-dense ${evt.sensitive ? "text-error font-bold" : "text-outline"}`}>
                    {evt.sensitive ? "ACCESS METADATA RECORDED" : evt.integrity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toast && (
          <div className="fixed bottom-space-lg right-space-lg z-50 bg-surface-container-highest border border-primary-container p-space-md max-w-sm" role="status">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">{toast}</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Frontend mock action only.</p>
            <button type="button" className="mt-space-sm font-label-sm text-label-sm text-outline uppercase" onClick={() => setToast(null)}>
              DISMISS
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
