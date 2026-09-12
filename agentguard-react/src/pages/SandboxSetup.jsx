import React from 'react';
import Layout from '../components/Layout';

export default function SandboxSetup() {
  return (
    <Layout active="sandbox-setup">
      <div className="flex flex-col w-full">
<div className="w-full bg-surface-container-lowest flex flex-col">
{/* Top Sub-Bar / Context Header */}
<div className="w-full bg-surface-container-low px-space-lg py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-surface-container-highest">
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<span className="font-headline-lg text-headline-lg text-primary uppercase tracking-tight">NEW SANDBOX SESSION</span>
<span className="px-space-xs py-0.5 bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold uppercase">ENV // PROV</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase mt-space-xs tracking-wider">
          CONFIGURE ISOLATED WORKSPACE ENVIRONMENT AND INITIALIZE AGENT MONITOR
        </p>
</div>
<div className="flex items-center gap-space-md font-code-dense text-code-dense text-on-surface-variant">
<div className="flex items-center gap-space-xs">
<span className="w-1.5 h-1.5 bg-primary-container inline-block"></span>
<span>HYPERVISOR: DOCKER_SOCK</span>
</div>
<div className="hidden lg:block text-outline">|</div>
<div className="hidden lg:block">SYS_CALL_INTERCEPT: ON</div>
</div>
</div>
{/* Main Workspace Split Matrix */}
<div className="w-full grid grid-cols-1 lg:grid-cols-12">
{/* Left / Center: Primary Form Engine (8 Cols) */}
<div className="lg:col-span-8 p-space-lg flex flex-col gap-space-xl bg-surface-container-lowest">
{/* SECTION 1: TARGET DIRECTORY */}
<div className="flex flex-col bg-surface-container-low p-space-lg">
<div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
<span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">01 // TARGET PROJECT DIRECTORY</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">[FS_KERNEL_NOTIFY]</span>
</div>
<label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs font-semibold" htmlFor="project-path">
            TARGET PROJECT
          </label>
<div className="relative flex items-center mb-space-xs">
<span className="absolute left-space-md font-code-dense text-code-dense text-outline select-none">$PATH:</span>
<input className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md pl-16 pr-space-md py-space-sm outline-none focus:ring-1 focus:ring-primary-container focus:bg-surface-container placeholder-outline transition-all" id="project-path" type="text" value="/Users/dev/projects/demo-app"/>
<button className="absolute right-1 px-space-md py-1 bg-surface-container-highest text-primary hover:bg-surface-bright font-label-sm text-label-sm uppercase transition-colors" type="button">
              BROWSE
            </button>
</div>
<p className="font-code-dense text-code-dense text-on-surface-variant flex items-center gap-space-xs mt-space-xs">
<span className="material-symbols-outlined text-[14px] text-primary-container">info</span>
            Local absolute path. Filesystem events will be captured via local watcher.
          </p>
</div>
{/* SECTION 2: CONTAINER IMAGE SELECTION */}
<div className="flex flex-col bg-surface-container-low p-space-lg">
<div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
<span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">02 // CONTAINER BASE IMAGE</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">[REGISTRY: CACHED]</span>
</div>
<label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs font-semibold" htmlFor="container-image">
            CONTAINER IMAGE
          </label>
<input className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md px-space-md py-space-sm outline-none focus:ring-1 focus:ring-primary-container transition-all" id="container-image" type="text" value="node:20-slim"/>
{/* Quick Presets */}
<div className="mt-space-md flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">PRESET SPECIFICATIONS:</span>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs" id="image-presets">
<button className="preset-btn px-space-sm py-space-xs bg-primary-container text-on-primary-fixed font-code-dense text-code-dense font-bold uppercase transition-all text-left truncate flex items-center justify-between" data-image="node:20-slim" type="button">
<span>node:20-slim</span>
<span className="text-[9px]">■ ACTIVE</span>
</button>
<button className="preset-btn px-space-sm py-space-xs bg-surface-container-highest text-on-surface font-code-dense text-code-dense hover:bg-surface-bright transition-all text-left truncate flex items-center justify-between" data-image="python:3.11-slim" type="button">
<span>python:3.11-slim</span>
</button>
<button className="preset-btn px-space-sm py-space-xs bg-surface-container-highest text-on-surface font-code-dense text-code-dense hover:bg-surface-bright transition-all text-left truncate flex items-center justify-between" data-image="rust:1.75-bookworm" type="button">
<span>rust:1.75-bookworm</span>
</button>
<button className="preset-btn px-space-sm py-space-xs bg-surface-container-highest text-on-surface font-code-dense text-code-dense hover:bg-surface-bright transition-all text-left truncate flex items-center justify-between" data-image="ubuntu:22.04" type="button">
<span>ubuntu:22.04</span>
</button>
</div>
</div>
</div>
{/* SECTION 3: SESSION METADATA */}
<div className="flex flex-col bg-surface-container-low p-space-lg">
<div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
<span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">03 // SESSION IDENTIFIER</span>
<span className="font-code-dense text-code-dense text-primary font-bold">AG-2026-002</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
<div>
<label className="font-label-md text-label-md text-on-surface uppercase mb-space-xs block font-semibold" htmlFor="session-name">
                SESSION NAME
              </label>
<input className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md px-space-md py-space-sm outline-none focus:ring-1 focus:ring-primary-container transition-all" id="session-name" type="text" value="demo-session"/>
</div>
<div>
<label className="font-label-md text-label-md text-outline uppercase mb-space-xs block font-semibold">
                AUTOGENERATED IDENTIFIER
              </label>
<div className="w-full bg-surface-container px-space-md py-space-sm flex items-center justify-between text-on-surface-variant font-code-dense text-code-dense select-none">
<span>SESSION ID: AG-2026-002</span>
<span className="text-primary-container font-bold">[STATIC LOCK]</span>
</div>
</div>
</div>
</div>
{/* SECTION 4: LOCAL MONITORING POLICY */}
<div className="flex flex-col bg-surface-container-low p-space-lg">
<div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-highest">
<span className="font-label-sm text-label-sm text-primary-container font-bold tracking-wider">04 // LOCAL MONITORING POLICY</span>
<span className="font-code-dense text-code-dense text-primary">[ACTIVE ENFORCEMENT]</span>
</div>
<div className="flex flex-col gap-space-sm" id="policy-toggles">
{/* Policy Item 1 */}
<label className="flex items-start gap-space-md p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-colors select-none">
<div className="mt-0.5 w-4 h-4 bg-surface-container-highest flex items-center justify-center">
<input defaultChecked={true} className="hidden peer policy-cb" type="checkbox"/>
<span className="w-2.5 h-2.5 bg-primary-container peer-checked:block hidden"></span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-primary font-bold">INTERCEPT FILE DELETIONS</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">Alert and suspend process execution immediately upon detection of mass directory or recursive removal.</span>
</div>
</label>
{/* Policy Item 2 */}
<label className="flex items-start gap-space-md p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-colors select-none">
<div className="mt-0.5 w-4 h-4 bg-surface-container-highest flex items-center justify-center">
<input defaultChecked={true} className="hidden peer policy-cb" type="checkbox"/>
<span className="w-2.5 h-2.5 bg-primary-container peer-checked:block hidden"></span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-primary font-bold">STRICT SENSITIVE PATH SHIELDING</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">Hard drop all attempts to read or mutate .ssh, .env, .aws, and .gnupg directories. Kernel trap armed.</span>
</div>
</label>
{/* Policy Item 3 */}
<label className="flex items-start gap-space-md p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-colors select-none">
<div className="mt-0.5 w-4 h-4 bg-surface-container-highest flex items-center justify-center">
<input defaultChecked={true} className="hidden peer policy-cb" type="checkbox"/>
<span className="w-2.5 h-2.5 bg-primary-container peer-checked:block hidden"></span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-primary font-bold">IN-MEMORY AUDIT BUFFER ONLY</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">Zero telemetry persist to disk. Audit logs are volatile and purged on sandbox termination.</span>
</div>
</label>
</div>
</div>
{/* Action Engine Area */}
<div className="flex flex-col gap-space-md mt-space-sm">
<button className="w-full py-space-lg px-space-xl bg-primary-container hover:bg-tertiary text-on-primary-fixed font-headline-lg text-headline-lg uppercase font-bold tracking-tight transition-all active:bg-surface-container-lowest active:text-primary-container flex items-center justify-center gap-space-md" id="launch-sandbox-btn" type="button">
<span className="material-symbols-outlined font-bold">power_settings_new</span>
<span id="launch-btn-text">START SANDBOX</span>
</button>
{/* Privacy Statement Box */}
<div className="p-space-md bg-surface-container-low flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[16px]">lock</span>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">LOCAL EXECUTION &amp; TELEMETRY PROTOCOL</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Project files remain on this machine. AgentGuard does not transmit project data externally. All monitoring takes place via local kernel/filesystem hooks. No telemetry, no external AI API calls.
            </p>
</div>
</div>
</div>
{/* Right: Specification & Live Audit Inspector Rail (4 Cols) */}
<div className="lg:col-span-4 bg-surface-container-low p-space-lg flex flex-col gap-space-xl">
{/* Specification Panel */}
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest">
<span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">SANDBOX SPECIFICATION</span>
<span className="w-2 h-2 bg-primary-container"></span>
</div>
<div className="flex flex-col divide-y divide-surface-container-highest font-code-dense text-code-dense">
<div className="py-space-sm flex items-center justify-between">
<span className="text-on-surface-variant uppercase">ENGINE</span>
<span className="text-primary font-bold">Local Container Daemon</span>
</div>
<div className="py-space-sm flex items-center justify-between">
<span className="text-on-surface-variant uppercase">NETWORK MODE</span>
<span className="text-primary font-bold">Host Loopback Only</span>
</div>
<div className="py-space-sm flex items-center justify-between">
<span className="text-on-surface-variant uppercase">FILESYSTEM MOUNT</span>
<span className="text-primary font-bold">Read-Write (/workspace)</span>
</div>
<div className="py-space-sm flex items-center justify-between">
<span className="text-on-surface-variant uppercase">LOGGING ARCH</span>
<span className="text-primary font-bold">Local Monospace Buffer</span>
</div>
<div className="py-space-sm flex items-center justify-between">
<span className="text-on-surface-variant uppercase">ISOLATION TIER</span>
<span className="text-primary-container font-bold">RING-3 USERSPACE CAGE</span>
</div>
</div>
</div>
{/* Resource Allocation Visualizer */}
<div className="flex flex-col gap-space-sm p-space-md bg-surface-container-lowest">
<div className="flex justify-between items-center text-label-sm font-label-sm uppercase">
<span className="text-on-surface">MEMORY CEILING CAP</span>
<span className="text-primary-container">4096 MB / ALLOCATED</span>
</div>
{/* Visualizer Bar */}
<div className="w-full h-2 bg-surface-container-highest flex">
<div className="h-full bg-primary-container w-2/3"></div>
<div className="h-full bg-surface-variant w-1/3"></div>
</div>
<div className="flex justify-between text-code-dense font-code-dense text-outline">
<span>USED: 2.7GB</span>
<span>CAP: 4.0GB</span>
</div>
</div>
{/* Terminal Status Stream Simulation */}
<div className="flex flex-col flex-grow">
<div className="bg-surface-container-highest px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-surface uppercase">
<span>PROVISIONING CONSOLE</span>
<span className="animate-pulse-fast text-primary-container font-bold">● RDY</span>
</div>
<div className="p-space-md bg-surface-container-lowest font-code-dense text-code-dense text-on-surface-variant flex flex-col gap-space-xs h-64 overflow-y-auto" id="terminal-stream">
<div><span className="text-outline">[00:00.01]</span> INIT AGENTGUARD DAEMON V0.1.9</div>
<div><span className="text-outline">[00:00.02]</span> LOCAL KERNEL INOTIFY SUITE ARMED</div>
<div><span className="text-outline">[00:00.04]</span> BINDING VIRTUAL MOUNT: /workspace</div>
<div><span className="text-outline">[00:00.07]</span> ENFORCING EGRESS FILTER (LOOPBACK ONLY)</div>
<div className="text-primary-container"><span className="text-outline">[00:00.08]</span> CONFIG READY: AWAITING USER DISPATCH_</div>
</div>
</div>
{/* Quick Status Metrics Matrix */}
<div className="grid grid-cols-2 gap-space-xs">
<div className="p-space-md bg-surface-container-lowest flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">CPU AFFINITY</span>
<span className="font-headline-sm text-headline-sm text-primary uppercase mt-space-xs">CORES 0-3</span>
</div>
<div className="p-space-md bg-surface-container-lowest flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">PID SANDBOX</span>
<span className="font-headline-sm text-headline-sm text-primary uppercase mt-space-xs">CGRU_V2</span>
</div>
</div>
</div>
</div>
</div>
      </div>
    </Layout>
  );
}
