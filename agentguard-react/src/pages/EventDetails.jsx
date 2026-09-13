import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ErrorState from "../components/ErrorState";
import { getEventById, MOCK_EVENTS } from "../mock/events";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = getEventById(id);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <Layout>
        <div className="p-space-xl">
          <ErrorState
            title="EVENT NOT FOUND"
            message={`No mock event exists for id "${id}".`}
            onRetry={() => navigate("/filesystem")}
          />
        </div>
      </Layout>
    );
  }

  const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
  const prev = idx > 0 ? MOCK_EVENTS[idx - 1] : null;
  const next = idx >= 0 && idx < MOCK_EVENTS.length - 1 ? MOCK_EVENTS[idx + 1] : null;
  const sensitive = event.sensitive;

  function copyMetadata() {
    const payload = {
      id: event.id,
      operation: event.operation,
      path: event.path,
      timestamp: event.timestamp,
      process: event.process,
      pid: event.pid,
      note: sensitive ? "Sensitive path — metadata only; no content captured." : "Metadata export (mock).",
    };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <section className="w-full bg-surface-container-low border-b border-surface-container-highest p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <Link to="/filesystem" className="font-label-sm text-label-sm uppercase text-outline hover:text-primary focus:outline-none focus:underline">
                ← ACTIVITY STREAM
              </Link>
              <span className="text-outline font-label-sm text-label-sm">/</span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container font-bold">
                {sensitive ? "SENSITIVE INTERCEPT" : "EVENT RECORD"}
              </span>
            </div>
            <div className="flex items-baseline gap-space-md flex-wrap">
              <h1 className="font-headline-lg text-headline-lg uppercase text-primary tracking-tight">EVENT DETAILS</h1>
              <span className="font-code-dense text-code-dense text-on-surface-variant bg-surface-container-highest px-space-sm py-0.5">
                RECORD ID: {event.id}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={copyMetadata}
            className="bg-surface border border-surface-container-highest text-on-surface font-label-md text-label-md uppercase px-space-md py-space-sm hover:bg-surface-bright focus:outline-none focus:ring-1 focus:ring-primary-container"
          >
            {copied ? "COPIED METADATA" : "COPY EVENT METADATA"}
          </button>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 w-full">
          <div className="xl:col-span-8 flex flex-col border-b xl:border-b-0 xl:border-r border-surface-container-highest bg-surface-container-lowest">
            {sensitive && (
              <div className="bg-error-container/20 border-b border-error-container p-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-error font-bold">
                  [!] SENSITIVE PATH — METADATA ONLY
                </span>
                <span className="font-code-dense text-code-dense text-on-error-container bg-error-container/40 px-space-sm py-0.5">
                  CONTENT CAPTURE: DISABLED
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 bg-surface-container-low border-b border-surface-container-highest">
              <div className="p-space-lg border-b md:border-b-0 md:border-r border-surface-container-highest flex flex-col gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-outline">EVENT ID</span>
                  <div className="font-headline-lg text-headline-lg text-primary font-bold mt-space-xs">{event.id}</div>
                </div>
                <div className="flex items-center justify-between pt-space-md border-t border-surface-container-highest">
                  <span className="font-code-dense text-code-dense text-on-surface-variant uppercase">TIMESTAMP</span>
                  <span className="font-body-md text-body-md text-primary font-bold">{event.timestamp}</span>
                </div>
              </div>
              <div className="p-space-lg flex flex-col gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-outline">DISPOSITION</span>
                  <div
                    className={`mt-space-xs border font-label-sm text-label-sm uppercase px-space-sm py-0.5 font-bold self-start inline-block ${
                      sensitive ? "border-error text-error" : "border-primary-container text-primary-container"
                    }`}
                  >
                    {event.disposition || (sensitive ? "BLOCKED / METADATA ONLY" : "AUDITED")}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-md border-t border-surface-container-highest">
                  <span className="font-code-dense text-code-dense text-on-surface-variant uppercase">SESSION</span>
                  <Link to={`/session/${event.sessionId}`} className="font-code-dense text-code-dense text-primary-container font-bold hover:underline focus:outline-none focus:underline">
                    {event.sessionId}
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-container border border-surface-container-highest p-space-md">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">OPERATION</span>
                <div className="font-body-lg text-body-lg text-primary font-bold mt-space-xs">{event.operation}</div>
              </div>
              <div className="bg-surface-container border border-surface-container-highest p-space-md">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">PATH</span>
                <div className={`font-body-lg text-body-lg font-bold mt-space-xs truncate ${sensitive ? "text-secondary" : "text-primary"}`}>
                  {event.path}
                </div>
                {sensitive && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    No file contents, secrets, or diffs are displayed.
                  </p>
                )}
              </div>
              <div className="bg-surface-container border border-surface-container-highest p-space-md">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">PROCESS</span>
                <div className="font-body-lg text-body-lg text-primary font-bold mt-space-xs">
                  {event.process} [PID:{event.pid}]
                </div>
              </div>
              <div className="bg-surface-container border border-surface-container-highest p-space-md">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">SIZE DELTA</span>
                <div className="font-body-lg text-body-lg text-primary font-bold mt-space-xs">{event.sizeDelta}</div>
              </div>
            </div>

            <div className="mx-space-lg mb-space-lg border-2 border-primary-container bg-surface-container-low p-space-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-primary">SECURITY &amp; PRIVACY</h3>
              <span className="font-label-sm text-label-sm uppercase text-primary-container font-bold">CONTENT CAPTURE: DISABLED</span>
              <p className="font-body-md text-body-md text-on-surface mt-space-md border-t border-surface-container-highest pt-space-md">
                For sensitive paths (<code className="text-primary-container bg-surface-container-highest px-1">.ssh/</code>,{" "}
                <code className="text-primary-container bg-surface-container-highest px-1">.env</code>,{" "}
                <code className="text-primary-container bg-surface-container-highest px-1">.aws/</code>), only path, operation,
                timestamp, and process metadata are shown.
              </p>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col bg-surface-container-low">
            <div className="p-space-md bg-surface-container-high border-b border-surface-container-highest">
              <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">AUDIT CHAIN</span>
            </div>
            {prev && (
              <Link to={`/event/${prev.id}`} className="p-space-md border-b border-surface-container-highest hover:bg-surface-container focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary-container">
                <span className="font-label-sm text-label-sm uppercase text-outline block">PREVIOUS</span>
                <span className="font-body-md text-body-md font-bold text-primary">{prev.id}</span>
                <span className="font-code-dense text-code-dense text-on-surface-variant block truncate">{prev.path}</span>
              </Link>
            )}
            <div className={`p-space-md border-b border-surface-container-highest ${sensitive ? "border-l-2 border-l-error bg-error-container/10" : "border-l-2 border-l-primary-container"}`}>
              <span className={`font-label-sm text-label-sm uppercase font-bold ${sensitive ? "text-error" : "text-primary-container"}`}>
                CURRENT
              </span>
              <div className="font-body-md text-body-md font-bold text-primary mt-space-xs">{event.id}</div>
              <div className={`font-code-dense text-code-dense truncate ${sensitive ? "text-error font-bold" : "text-on-surface-variant"}`}>
                {event.path}
              </div>
            </div>
            {next && (
              <Link to={`/event/${next.id}`} className="p-space-md border-b border-surface-container-highest hover:bg-surface-container focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary-container">
                <span className="font-label-sm text-label-sm uppercase text-outline block">NEXT</span>
                <span className="font-body-md text-body-md font-bold text-primary">{next.id}</span>
                <span className="font-code-dense text-code-dense text-on-surface-variant block truncate">{next.path}</span>
              </Link>
            )}
            <div className="p-space-lg mt-auto">
              <Link
                to="/filesystem"
                className="w-full bg-surface-container-highest text-on-surface border border-surface-container-high py-space-sm px-space-md font-label-md text-label-md uppercase text-center block hover:bg-surface-bright focus:outline-none focus:ring-1 focus:ring-primary-container"
              >
                ← RETURN TO FILESYSTEM
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
