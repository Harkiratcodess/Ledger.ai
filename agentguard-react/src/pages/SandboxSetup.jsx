import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";

const PRESETS = ["node:20-slim", "python:3.11-slim", "rust:1.75-bookworm", "ubuntu:22.04"];

/** UI-only sandbox lifecycle. Does not start Docker or call an API. */
export default function SandboxSetup() {
  const [projectPath, setProjectPath] = useState("/Users/dev/projects/demo-app");
  const [image, setImage] = useState("node:20-slim");
  const [sessionName, setSessionName] = useState("demo-session");
  const [status, setStatus] = useState("IDLE");
  const [consoleLines, setConsoleLines] = useState([
    "[00:00.01] INIT AGENTGUARD UI PROTOTYPE",
    "[00:00.02] MOCK PROVISIONING CONSOLE READY",
    "[00:00.04] AWAITING START SANDBOX (UI SIMULATION)",
  ]);
  const [policies, setPolicies] = useState({
    deletions: true,
    sensitive: true,
    buffer: true,
  });

  useEffect(() => {
    if (status !== "INITIALIZING") return undefined;
    const t = setTimeout(() => {
      setStatus("ACTIVE");
      setConsoleLines((prev) => [
        ...prev,
        "[00:01.20] UI SIM: CONTAINER LABEL ASSIGNED",
        "[00:01.40] UI SIM: WATCHER STATE → READY",
        "[00:01.55] SANDBOX ACTIVE (MOCK)",
      ]);
    }, 1600);
    return () => clearTimeout(t);
  }, [status]);

  function handleStart() {
    if (status === "INITIALIZING") return;
    if (status === "ACTIVE") {
      setStatus("IDLE");
      setConsoleLines((prev) => [...prev, "[--:--.--] SANDBOX STOPPED (UI SIMULATION)"]);
      return;
    }
    setStatus("INITIALIZING");
    setConsoleLines((prev) => [
      ...prev,
      "[00:01.00] INITIALIZING SANDBOX...",
      "[00:01.10] UI SIMULATION — NO DOCKER CALL",
    ]);
  }

  function togglePolicy(key) {
    setPolicies((p) => ({ ...p, [key]: !p[key] }));
  }

  const buttonLabel =
    status === "INITIALIZING"
      ? "INITIALIZING..."
      : status === "ACTIVE"
        ? "STOP SANDBOX [UI]"
        : "START SANDBOX";

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-lowest flex flex-col">
          <div className="w-full bg-surface-container-low px-space-lg py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-surface-container-highest">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-tight">
                  NEW SANDBOX SESSION
                </span>
                <span className="px-space-xs py-0.5 bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold uppercase">
                  UI // SIM
                </span>
                <span
                  className={`px-space-xs py-0.5 border font-label-sm text-label-sm uppercase font-bold ${
                    status === "ACTIVE"
                      ? "border-primary-container text-primary-container"
                      : status === "INITIALIZING"
                        ? "border-outline text-outline"
                        : "border-surface-container-highest text-outline"
                  }`}
                >
                  {status === "ACTIVE" ? "SANDBOX ACTIVE" : status}
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase mt-space-xs tracking-wider">
                Configure workspace — launch is a frontend simulation only
              </p>
            </div>
            <div className="flex items-center gap-space-md font-code-dense text-code-dense text-on-surface-variant">
              <span>ENGINE: MOCK UI</span>
              <span className="hidden lg:block text-outline">|</span>
              <span className="hidden lg:block">NO DOCKER CONNECTION</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8 p-space-lg flex flex-col gap-space-xl bg-surface-container-lowest">
              <div className="flex flex-col bg-surface-container-low p-space-lg">
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
                  <span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">
                    01 // TARGET PROJECT DIRECTORY
                  </span>
                  <span className="font-code-dense text-code-dense text-on-surface-variant">[UI INPUT]</span>
                </div>
                <label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs font-semibold" htmlFor="project-path">
                  TARGET PROJECT
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-space-md font-code-dense text-code-dense text-outline select-none">$PATH:</span>
                  <input
                    className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md pl-16 pr-24 py-space-sm outline-none border border-surface-container-highest focus:border-primary-container"
                    id="project-path"
                    type="text"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                  />
                  <button
                    className="absolute right-1 px-space-md py-1 bg-surface-container-highest text-primary hover:bg-surface-bright font-label-sm text-label-sm uppercase"
                    type="button"
                    onClick={() => setProjectPath("/workspace/demo-project")}
                  >
                    BROWSE [MOCK]
                  </button>
                </div>
              </div>

              <div className="flex flex-col bg-surface-container-low p-space-lg">
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
                  <span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">
                    02 // CONTAINER BASE IMAGE
                  </span>
                </div>
                <label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs font-semibold" htmlFor="container-image">
                  CONTAINER IMAGE
                </label>
                <input
                  className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md px-space-md py-space-sm outline-none border border-surface-container-highest focus:border-primary-container"
                  id="container-image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <div className="mt-space-md grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setImage(preset)}
                      className={`px-space-sm py-space-xs font-code-dense text-code-dense uppercase text-left truncate focus:outline-none focus:ring-1 focus:ring-primary-container ${
                        image === preset
                          ? "bg-primary-container text-on-primary-fixed font-bold"
                          : "bg-surface-container-highest text-on-surface hover:bg-surface-bright"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col bg-surface-container-low p-space-lg">
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
                  <span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">
                    03 // SESSION IDENTIFIER
                  </span>
                  <span className="font-code-dense text-code-dense text-primary font-bold">AG-2026-002</span>
                </div>
                <label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs block font-semibold" htmlFor="session-name">
                  SESSION NAME
                </label>
                <input
                  className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md px-space-md py-space-sm outline-none border border-surface-container-highest focus:border-primary-container"
                  id="session-name"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>

              <div className="flex flex-col bg-surface-container-low p-space-lg">
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
                  <span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">
                    04 // LOCAL MONITORING POLICY
                  </span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {[
                    { key: "deletions", title: "INTERCEPT FILE DELETIONS", desc: "Alert on mass directory removal (UI preference)." },
                    { key: "sensitive", title: "STRICT SENSITIVE PATH SHIELDING", desc: "Metadata only for .ssh, .env, .aws. No content capture." },
                    { key: "buffer", title: "IN-MEMORY AUDIT BUFFER ONLY", desc: "UI preference for volatile local audit buffer." },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-space-md p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="mt-1 accent-[#b2f800] w-4 h-4"
                        checked={policies[item.key]}
                        onChange={() => togglePolicy(item.key)}
                      />
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-primary font-bold">{item.title}</span>
                        <span className="font-code-dense text-code-dense text-on-surface-variant">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-space-md">
                {status === "INITIALIZING" && (
                  <div className="border border-surface-container-highest bg-surface-container-low p-space-md">
                    <LoadingState label="INITIALIZING SANDBOX..." />
                    <p className="font-code-dense text-code-dense text-outline mt-space-sm uppercase">
                      UI simulation — Docker is not started
                    </p>
                  </div>
                )}

                {status === "ACTIVE" && (
                  <div className="border border-primary-container bg-surface-container-low p-space-md flex flex-col gap-space-sm">
                    <span className="font-headline-sm text-headline-sm uppercase text-primary-container">SANDBOX ACTIVE</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-code-dense text-code-dense">
                      <div>
                        <span className="text-outline uppercase block">CONTAINER</span>
                        <span className="text-primary font-bold">agentguard-sandbox-01</span>
                      </div>
                      <div>
                        <span className="text-outline uppercase block">WATCHER</span>
                        <span className="text-primary-container font-bold">READY</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline uppercase">[ UI SIMULATION ]</span>
                  </div>
                )}

                <button
                  className="w-full py-space-lg px-space-xl bg-primary-container hover:bg-tertiary text-on-primary-fixed font-headline-lg text-headline-lg uppercase font-bold tracking-tight disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-primary"
                  type="button"
                  onClick={handleStart}
                  disabled={status === "INITIALIZING"}
                >
                  {buttonLabel}
                </button>

                <div className="p-space-md bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-xs">
                    LOCAL EXECUTION &amp; TELEMETRY PROTOCOL
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Designed for local monitoring with no external telemetry. This screen simulates sandbox lifecycle in the UI only.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-surface-container-low p-space-lg flex flex-col gap-space-xl">
              <div className="flex flex-col gap-space-md">
                <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider border-b border-surface-container-highest pb-space-sm">
                  SANDBOX SPECIFICATION
                </span>
                <div className="flex flex-col divide-y divide-surface-container-highest font-code-dense text-code-dense">
                  {[
                    ["ENGINE", "UI Mock Provisioner"],
                    ["IMAGE", image],
                    ["PATH", projectPath],
                    ["SESSION", sessionName],
                  ].map(([k, v]) => (
                    <div key={k} className="py-space-sm flex items-center justify-between gap-space-sm">
                      <span className="text-on-surface-variant uppercase shrink-0">{k}</span>
                      <span className="text-primary font-bold truncate text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <div className="bg-surface-container-highest px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-surface uppercase">
                  <span>PROVISIONING CONSOLE</span>
                  <span className={status === "ACTIVE" ? "text-primary-container font-bold" : "text-outline"}>
                    {status === "ACTIVE" ? "ACTIVE" : status === "INITIALIZING" ? "INIT" : "RDY"}
                  </span>
                </div>
                <div className="p-space-md bg-surface-container-lowest font-code-dense text-code-dense text-on-surface-variant flex flex-col gap-space-xs h-64 overflow-y-auto border border-surface-container-highest border-t-0">
                  {consoleLines.map((line, i) => (
                    <div key={`${line}-${i}`} className={line.includes("ACTIVE") || line.includes("READY") ? "text-primary-container" : ""}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
