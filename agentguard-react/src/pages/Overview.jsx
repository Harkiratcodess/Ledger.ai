import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FIELD = "—";
const RISK_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

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
  const riskLevel = String(rawEvent?.riskLevel || "LOW").toUpperCase();
  const target = rawEvent?.path
    ? rawEvent.path
    : rawEvent?.hostname
      ? rawEvent.hostname
      : rawEvent?.url || EMPTY_FIELD;
  const targetContext = rawEvent?.path
    ? rawEvent.path
    : rawEvent?.hostname
      ? `${rawEvent.hostname}${rawEvent?.url ? ` / ${rawEvent.url}` : ""}`
      : rawEvent?.url || EMPTY_FIELD;

  const enforcementAction = String(rawEvent?.enforcementAction || "allow").toLowerCase();
  const enforcementStatus = String(rawEvent?.enforcementStatus || "not_required").toLowerCase();

  let enforcementLabel = "ALLOW";
  let enforcementTone = "bg-primary-container text-on-primary-fixed";

  if (enforcementStatus === "paused" || enforcementAction === "pause") {
    enforcementLabel = "PAUSED";
    enforcementTone = "bg-secondary-container text-on-secondary-fixed";
  } else if (enforcementStatus === "terminated" || enforcementStatus === "killed" || enforcementAction === "kill") {
    enforcementLabel = "TERMINATED";
    enforcementTone = "bg-error-container text-error";
  } else if (enforcementStatus === "logged" || enforcementAction === "record") {
    enforcementLabel = "RECORD";
    enforcementTone = "bg-warning-container text-on-warning-container";
  }

  return {
    id: rawEvent?._id || rawEvent?.id || "unknown",
    type: rawEvent?.type || "unknown",
    timestamp: formatTimestamp(rawEvent?.timestamp),
    target,
    targetContext,
    riskLevel,
    riskScore: rawEvent?.riskScore ?? EMPTY_FIELD,
    riskReason: rawEvent?.riskReason || "No risk indicators detected.",
    enforcementLabel,
    enforcementTone,
    eventCategory: rawEvent?.path ? "filesystem" : rawEvent?.hostname || rawEvent?.url ? "network" : "event",
  };
}

export default function Overview() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sandbox, setSandbox] = useState({ active: false });
  const [sandboxLoading, setSandboxLoading] = useState(true);
  const [sandboxError, setSandboxError] = useState("");
  const [sandboxAction, setSandboxAction] = useState("");

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
      setError(err.message || "Unable to load live Ledger events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadSandboxStatus() {
    setSandboxLoading(true);
    setSandboxError("");

    try {
      const response = await fetch("http://localhost:5000/api/sandbox/status");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || `Request failed with status ${response.status}`);
      setSandbox(payload);
    } catch (err) {
      setSandboxError(err.message || "Unable to load sandbox status.");
    } finally {
      setSandboxLoading(false);
    }
  }

  useEffect(() => {
    loadSandboxStatus();
  }, []);

  async function controlSandbox(action) {
    setSandboxAction(action);
    setSandboxError("");

    try {
      const response = await fetch(`http://localhost:5000/api/sandbox/${action}`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || `Request failed with status ${response.status}`);
      setSandbox(payload);
    } catch (err) {
      setSandboxError(err.message || `Unable to ${action} sandbox.`);
    } finally {
      setSandboxAction("");
    }
  }

  const summary = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

    events.forEach((event) => {
      if (counts[event.riskLevel] !== undefined) {
        counts[event.riskLevel] += 1;
      }
    });

    return counts;
  }, [events]);

  const recentEvents = useMemo(() => events.slice(0, 8), [events]);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-xs text-on-surface-variant font-code-dense text-code-dense select-none">
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="text-primary-container font-bold">STREAM=LIVE</span>
            <span>DATASOURCE=LOCAL API</span>
            <span>MODE=PROTECTED</span>
          </div>
          <span className="text-primary">RUNTIME: LOCAL</span>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 bg-surface-container-highest">
          {RISK_ORDER.map((level) => (
            <div key={level} className="bg-surface p-space-md flex flex-col justify-between border-b border-r border-surface-container-highest last:border-r-0">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">{level}</span>
                <span className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 bg-primary-container inline-block" /> {summary[level] ?? 0}
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-headline-xl text-headline-xl text-primary font-bold tracking-tighter">{summary[level] ?? 0}</div>
                <div className="font-code-dense text-code-dense text-outline mt-space-xs">{level} RISK EVENTS</div>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-surface flex flex-col">
          <div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">RISK SUMMARY</span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">LIVE EVENT FEED</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 bg-surface-container-highest">
            {[
              ["TOTAL EVENTS", events.length],
              ["LOW", summary.LOW],
              ["MEDIUM", summary.MEDIUM],
              ["HIGH + CRITICAL", (summary.HIGH || 0) + (summary.CRITICAL || 0)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-space-sm flex flex-col border-b border-r border-surface-container-highest last:border-r-0">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</span>
                <span className="font-body-md text-body-md text-primary font-bold mt-space-xs">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col bg-surface">
          <div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">RECENT SECURITY EVENTS</span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">MONGO-BACKED</span>
            </div>
          </div>

          {loading ? (
            <div className="w-full p-space-xl">
              <LoadingState label="LOADING RISK EVENTS..." />
            </div>
          ) : error ? (
            <div className="w-full p-space-xl">
              <ErrorState title="RISK EVENT LOAD FAILED" message={error} onRetry={loadEvents} />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
                <thead className="bg-surface-container-low border-b border-surface-container-highest">
                  <tr className="font-headline-sm text-[11px] text-outline uppercase tracking-wider">
                    <th className="w-28 py-2 px-space-md border-r border-surface-container-highest">TYPE</th>
                    <th className="w-36 py-2 px-space-md border-r border-surface-container-highest">TIMESTAMP</th>
                    <th className="py-2 px-space-md border-r border-surface-container-highest">TARGET</th>
                    <th className="w-32 py-2 px-space-md border-r border-surface-container-highest">RISK</th>
                    <th className="w-24 py-2 px-space-md border-r border-surface-container-highest">SCORE</th>
                    <th className="w-28 py-2 px-space-md border-r border-surface-container-highest">ENFORCEMENT</th>
                    <th className="py-2 px-space-md">REASON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-surface-container">
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm uppercase text-on-surface">
                        {event.type}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
                        {event.timestamp}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-primary truncate">
                        {event.targetContext}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest">
                        <span className={`inline-block px-1 py-0.5 border text-label-sm font-bold ${
                          event.riskLevel === "LOW"
                            ? "border-primary-container text-primary-container"
                            : event.riskLevel === "MEDIUM"
                              ? "border-secondary-container text-secondary"
                              : event.riskLevel === "HIGH"
                                ? "border-warning-container text-warning"
                                : "border-error-container text-error"
                        }`}>
                          {event.riskLevel}
                        </span>
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface">
                        {event.riskScore}
                      </td>
                      <td className="py-2 px-space-md border-r border-surface-container-highest">
                        <span className={`inline-block px-1 py-0.5 border text-label-sm font-bold ${event.enforcementTone}`}>
                          {event.enforcementLabel}
                        </span>
                      </td>
                      <td className="py-2 px-space-md font-code-dense text-code-dense text-on-surface-variant">
                        {event.riskReason}
                      </td>
                    </tr>
                  ))}
                  {recentEvents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-space-md py-space-xl text-center font-label-md text-label-md text-outline uppercase">
                        NO LIVE RISK EVENTS RECORDED
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-surface flex flex-col border-b border-surface-container-highest">
          <div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">ACTIVE SANDBOX</span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">OPERATOR CONTROL</span>
            </div>
            <span className="font-code-dense text-code-dense text-outline uppercase">
              {sandboxLoading ? "CHECKING" : sandbox.active ? sandbox.status : "NO ACTIVE SANDBOX"}
            </span>
          </div>
          <div className="p-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-1 font-code-dense text-code-dense">
              <span className="text-on-surface-variant uppercase">SESSION</span>
              <span className="text-primary truncate max-w-full">{sandbox.sessionId || "NONE"}</span>
              <span className="text-on-surface-variant uppercase">CONTAINER</span>
              <span className="text-primary truncate max-w-full">{sandbox.containerId || "NONE"}</span>
              {sandboxError && <span className="text-error">{sandboxError}</span>}
            </div>
            <div className="flex flex-wrap gap-space-sm">
              {["pause", "resume", "kill"].map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={!sandbox.active || Boolean(sandboxAction)}
                  onClick={() => controlSandbox(action)}
                  className={`px-space-md py-space-sm border font-label-md text-label-md uppercase font-bold disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary-container ${
                    action === "kill"
                      ? "border-error-container text-error hover:bg-error-container"
                      : "border-surface-container-highest text-primary hover:bg-surface-container-high"
                  }`}
                >
                  {sandboxAction === action ? `${action}...` : action}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
