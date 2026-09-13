import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { MOCK_EVENTS } from "../mock/events";

const ROWS = MOCK_EVENTS.slice(0, 8);

export default function Overview() {
  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-xs text-on-surface-variant font-code-dense text-code-dense select-none">
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="text-primary-container font-bold">UI::MOCK_READY</span>
            <span>STREAM=MOCK</span>
            <span>MODE=PROTOTYPE</span>
          </div>
          <span className="text-primary">LOCAL INSTANCE</span>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 bg-surface-container-highest">
          <div className="bg-surface p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">SANDBOX</span>
              <span className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-space-xs">
                <span className="w-1.5 h-1.5 bg-primary-container inline-block" /> RUNNING [MOCK]
              </span>
            </div>
            <div className="my-space-md">
              <div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">agentguard-sandbox-01</div>
              <div className="font-code-dense text-code-dense text-outline mt-space-xs">UI label only</div>
            </div>
          </div>
          <div className="bg-surface p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">FILESYSTEM WATCHER</span>
              <span className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-space-xs">
                <span className="w-1.5 h-1.5 bg-primary-container inline-block animate-pulse-fast" /> MOCK STREAM
              </span>
            </div>
            <div className="my-space-md">
              <div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">ui event feed</div>
              <div className="font-code-dense text-code-dense text-outline mt-space-xs">watcher not connected</div>
            </div>
          </div>
          <div className="bg-surface p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">TARGET PROJECT</span>
              <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-[2px] font-bold">MUTABLE</span>
            </div>
            <div className="my-space-md">
              <div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">demo-project</div>
              <div className="font-code-dense text-code-dense text-outline mt-space-xs truncate">/workspace/demo-project</div>
            </div>
          </div>
          <div className="bg-surface p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">EVENTS</span>
              <span className="font-label-sm text-label-sm text-outline">THIS SESSION</span>
            </div>
            <div className="my-space-md flex items-baseline justify-between">
              <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tighter">00128</span>
              <span className="font-label-sm text-label-sm text-primary-container">mock count</span>
            </div>
          </div>
        </section>

        <section className="bg-surface flex flex-col">
          <div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">
                CURRENT SESSION // AG-2026-001
              </span>
              <span className="font-label-sm text-label-sm px-space-xs py-[2px] bg-surface text-primary-container">MOCK RUNTIME</span>
            </div>
            <Link
              to="/session/AG-2026-001"
              className="bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-surface px-space-md py-space-xs font-label-md text-label-md uppercase font-bold flex items-center gap-space-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <span>INSPECT SESSION</span>
              <span className="font-mono">[-&gt;]</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 bg-surface-container-highest">
            {[
              ["SESSION ID", "AG-2026-001"],
              ["STARTED", "10:38:12.104"],
              ["DURATION", "00:04:19"],
              ["PROJECT", "demo-project"],
              ["SANDBOX STATUS", "ACTIVE [MOCK]"],
              ["WRITE PROTECTION", "ENFORCED [UI]"],
              ["SHIELDED PATHS", "3 (.ssh, .env, .aws)"],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-space-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</span>
                <span className="font-body-md text-body-md text-primary font-bold mt-space-xs">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col bg-surface">
          <div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">LIVE FILE ACTIVITY</span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">MOCK STREAM</span>
            </div>
            <Link to="/filesystem" className="font-label-sm text-label-sm uppercase text-outline hover:text-primary-container focus:outline-none focus:underline">
              OPEN FILESYSTEM →
            </Link>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm table-fixed min-w-[960px]">
              <thead>
                <tr className="bg-surface-container-highest text-on-surface-variant font-headline-sm text-headline-sm">
                  <th className="w-32 px-space-md py-space-xs uppercase">TIMESTAMP</th>
                  <th className="w-28 px-space-md py-space-xs uppercase">OP</th>
                  <th className="px-space-md py-space-xs uppercase">PATH</th>
                  <th className="w-64 px-space-md py-space-xs uppercase">PROCESS / ORIGIN</th>
                  <th className="w-32 px-space-md py-space-xs uppercase text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((evt) => (
                  <tr key={evt.id} className={`group hover:bg-surface-container-high h-7 ${evt.sensitive ? "bg-surface-container-low" : ""}`}>
                    <td className="px-space-md py-space-xs font-mono text-outline">{evt.timestamp}</td>
                    <td className="px-space-md py-space-xs">
                      <span
                        className={`px-space-xs py-[2px] font-label-sm text-label-sm font-bold ${
                          evt.operation === "CREATE"
                            ? "bg-primary-container text-on-primary-fixed"
                            : evt.operation === "DELETE"
                              ? "bg-secondary-container text-tertiary"
                              : evt.operation === "ACCESS"
                                ? "bg-error-container text-error"
                                : "bg-surface-container-highest text-primary"
                        }`}
                      >
                        {evt.operation}
                      </span>
                    </td>
                    <td className={`px-space-md py-space-xs font-mono font-medium truncate ${evt.sensitive ? "text-error" : "text-primary"}`}>
                      {evt.path}
                      {evt.blocked && (
                        <span className="font-code-dense text-code-dense bg-error-container text-error px-space-xs uppercase ml-space-sm">
                          [BLOCKED]
                        </span>
                      )}
                      {evt.sensitive && !evt.blocked && (
                        <span className="font-code-dense text-code-dense bg-surface-container text-secondary px-space-xs uppercase ml-space-sm">
                          [METADATA ONLY]
                        </span>
                      )}
                    </td>
                    <td className={`px-space-md py-space-xs font-mono ${evt.sensitive ? "text-error" : "text-on-surface-variant"}`}>
                      {evt.process}
                      <span className="text-outline">[PID:{evt.pid}]</span>
                    </td>
                    <td className="px-space-md py-space-xs text-right">
                      <Link
                        to={`/event/${evt.id}`}
                        className={`font-code-dense text-code-dense uppercase focus:outline-none focus:underline ${
                          evt.sensitive ? "text-error hover:text-tertiary font-bold" : "text-outline hover:text-primary-container"
                        }`}
                      >
                        [{evt.id}]
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low px-space-md py-space-xs flex flex-wrap items-center justify-between text-outline font-code-dense text-code-dense">
            <span>SHOWING {ROWS.length} OF 128 MOCK EVENTS</span>
            <span className="text-primary-container">SENSITIVE PATHS: METADATA ONLY</span>
          </div>
        </section>
      </div>
    </Layout>
  );
}
