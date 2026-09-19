import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const STATUS_STYLES = {
  RUNNING: "text-primary-container border-primary-container",
  ACTIVE: "text-primary-container border-primary-container",
  PAUSED: "text-secondary border-secondary",
  STOPPED: "text-outline border-surface-container-highest",
  KILLED: "text-error border-error",
  COMPLETED: "text-on-surface border-outline",
  CREATED: "text-outline border-surface-container-highest",
  FAILED: "text-error border-error",
};

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost:5000/api/sessions")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setConnected(true);
        setSessions(Array.isArray(payload?.sessions) ? payload.sessions : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setConnected(false);
        setError(err.message || "Runtime not connected.");
        setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-low border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
              AUDIT LEDGER // SESSION INDEX
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
              AUDIT SESSIONS
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase mt-space-xs">
              {connected ? "Live sessions from the local Ledger runtime" : "Connect the Ledger runtime to load sessions"}
            </p>
          </div>
          <Link
            to="/sandbox-setup"
            className="bg-primary-container text-on-primary-fixed font-label-md text-label-md uppercase px-space-md py-space-sm font-bold hover:bg-primary hover:text-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            NEW SANDBOX
          </Link>
        </div>

        {error && !connected ? (
          <div className="px-space-lg py-space-xl font-body-md text-body-md text-on-surface-variant">
            Runtime disconnected. Start Ledger with `ledger protect .` or `npm start` in backend, then refresh.
          </div>
        ) : (
          <div className="w-full overflow-x-auto bg-surface-container-lowest">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-surface-container border-b border-surface-container-highest font-headline-sm text-headline-sm text-outline uppercase">
                  <th className="px-space-md py-space-sm">SESSION</th>
                  <th className="px-space-md py-space-sm">WORKSPACE</th>
                  <th className="px-space-md py-space-sm">STATUS</th>
                  <th className="px-space-md py-space-sm">CONTAINER</th>
                  <th className="px-space-md py-space-sm">STARTED</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-space-md py-space-xl text-outline font-label-md text-label-md uppercase">
                      No sessions recorded
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      onClick={() => navigate(`/session/${session.sessionId}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/session/${session.sessionId}`);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      className="border-b border-surface-container-highest hover:bg-surface-container cursor-pointer transition-colors focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-inset focus:ring-primary-container"
                    >
                      <td className="px-space-md py-space-sm font-body-md text-body-md text-primary font-bold">
                        {session.sessionId}
                      </td>
                      <td className="px-space-md py-space-sm font-code-dense text-code-dense text-on-surface truncate max-w-xs">
                        {session.workspace || "—"}
                      </td>
                      <td className="px-space-md py-space-sm">
                        <span
                          className={`inline-block px-space-xs py-[2px] border font-label-sm text-label-sm uppercase font-bold ${
                            STATUS_STYLES[session.status] || STATUS_STYLES.STOPPED
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-space-md py-space-sm font-code-dense text-code-dense text-on-surface">
                        {session.containerId ? String(session.containerId).slice(0, 12) : "—"}
                      </td>
                      <td className="px-space-md py-space-sm font-code-dense text-code-dense text-outline">
                        {session.startedAt ? new Date(session.startedAt).toLocaleTimeString("en-GB", { hour12: false }) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
