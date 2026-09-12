import React from 'react';
import Layout from '../components/Layout';

export default function Overview() {
  return (
    <Layout active="overview">
      <div className="flex flex-col w-full">
{/* CONSOLE COMMAND BANNER / TICKER */}
<div className="w-full bg-surface-container-lowest flex items-center justify-between px-space-md py-space-xs text-on-surface-variant font-code-dense text-code-dense select-none">
<div className="flex items-center gap-space-md">
<span className="text-primary-container font-bold">KERNEL::SYS_READY</span>
<span>INODE_MONITOR=ON</span>
<span>SEC_RING=0</span>
<span>HOOK=EBPF_PROBE_V3</span>
</div>
<div className="flex items-center gap-space-lg">
<span>IO_LATENCY: 0.12ms</span>
<span>DROP_RATE: 0.00%</span>
<span className="text-primary">UTC 10:43:14</span>
</div>
</div>
{/* TOP SECTION: SYSTEM STATUS (4-COLUMN BRUTALIST GRID) */}
<section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 bg-surface-container-highest">
{/* 1. SANDBOX */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">SANDBOX</span>
<span className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-space-xs">
<span className="w-1.5 h-1.5 bg-primary-container inline-block"></span> RUNNING
        </span>
</div>
<div className="my-space-md">
<div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">agentguard-sandbox-01</div>
<div className="font-code-dense text-code-dense text-outline mt-space-xs font-mono">cid: 9f8a3c2e7b1404aa</div>
</div>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-code-dense text-code-dense text-outline">TYPE: HYPERVISOR_L3</span>
<span className="font-code-dense text-code-dense text-primary-container">MEM: 142MB / 2GB</span>
</div>
</div>
{/* 2. FILESYSTEM WATCHER */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">FILESYSTEM WATCHER</span>
<span className="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-space-xs">
<span className="w-1.5 h-1.5 bg-primary-container inline-block animate-pulse-fast"></span> ACTIVE
        </span>
</div>
<div className="my-space-md">
<div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">chokidar engine</div>
<div className="font-code-dense text-code-dense text-outline mt-space-xs font-mono">latency: 4ms (buffered)</div>
</div>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-code-dense text-code-dense text-outline">QUEUE_PRESSURE: 0.04</span>
<span className="font-code-dense text-code-dense text-primary">POLL: EV_NOTIFY</span>
</div>
</div>
{/* 3. TARGET PROJECT */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">TARGET PROJECT</span>
<span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-[2px] font-bold">MUTABLE</span>
</div>
<div className="my-space-md">
<div className="font-headline-sm text-headline-sm uppercase text-primary tracking-tight">demo-project</div>
<div className="font-code-dense text-code-dense text-outline mt-space-xs truncate">/workspace/demo-project</div>
</div>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-code-dense text-code-dense text-primary-container">git: main</span>
<span className="font-code-dense text-code-dense text-outline">REV: a94f201</span>
</div>
</div>
{/* 4. EVENTS TELEMETRY */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">EVENTS</span>
<span className="font-label-sm text-label-sm text-outline">THIS SESSION</span>
</div>
<div className="my-space-md flex items-baseline justify-between">
<span className="font-headline-xl text-headline-xl text-primary font-bold font-headline-xl tracking-tighter">00128</span>
<span className="font-label-sm text-label-sm text-primary-container font-mono">avg 3.2 ev/sec</span>
</div>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-code-dense text-code-dense text-outline">ANOMALIES: 02</span>
<span className="font-code-dense text-code-dense text-error">INTERCEPT: 01</span>
</div>
</div>
</section>
{/* MIDDLE SECTION: CURRENT SESSION CONTROLLER */}
<section className="bg-surface flex flex-col">
{/* Session Bar Header */}
<div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between">
<div className="flex items-center gap-space-md">
<span className="material-symbols-outlined text-primary-container text-[18px]">terminal</span>
<span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">CURRENT SESSION // AG-2026-001</span>
<span className="font-label-sm text-label-sm px-space-xs py-[2px] bg-surface text-primary-container">AUTONOMOUS RUNTIME</span>
</div>
<a className="bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-surface px-space-md py-space-xs font-label-md text-label-md uppercase font-bold flex items-center gap-space-xs transition-none" data-path="sessions" href="#">
<span>INSPECT SESSION</span>
<span className="font-mono">[-&gt;]</span>
</a>
</div>
{/* Session Specs Matrix Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 bg-surface-container-highest">
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">SESSION ID</span>
<span className="font-body-md text-body-md text-primary font-bold mt-space-xs">AG-2026-001</span>
</div>
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">STARTED</span>
<span className="font-body-md text-body-md text-on-surface mt-space-xs font-mono">10:38:12.104</span>
</div>
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">DURATION</span>
<span className="font-body-md text-body-md text-primary-container font-mono mt-space-xs" id="session-timer">00:04:19</span>
</div>
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">PROJECT</span>
<span className="font-body-md text-body-md text-on-surface truncate mt-space-xs">demo-project</span>
</div>
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">SANDBOX STATUS</span>
<span className="font-body-md text-body-md text-primary-container flex items-center gap-space-xs mt-space-xs">
<span className="w-2 h-2 bg-primary-container inline-block"></span> ACTIVE
        </span>
</div>
<div className="bg-surface p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">WRITE PROTECTION</span>
<span className="font-body-md text-body-md text-primary font-bold mt-space-xs">ENFORCED</span>
</div>
<div className="bg-surface p-space-sm flex flex-col col-span-2 md:col-span-4 xl:col-span-1">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">SHIELDED PATHS</span>
<span className="font-body-md text-body-md text-secondary font-mono mt-space-xs">3 (.ssh, .env, .aws)</span>
</div>
</div>
</section>
{/* MAIN SECTION: LIVE FILE ACTIVITY TELEMETRY */}
<section className="flex flex-col bg-surface">
{/* Terminal Viewport Control Strip */}
<div className="bg-surface-container-high px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">LIVE FILE ACTIVITY</span>
<span className="text-outline">/</span>
<span className="font-label-sm text-label-sm text-outline">STREAM TELEMETRY</span>
</div>
<div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-[2px]">
<span className="w-1.5 h-1.5 bg-primary-container animate-pulse-fast inline-block"></span>
<span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">STREAMING</span>
</div>
<div className="font-label-sm text-label-sm text-on-surface-variant font-mono">
<span className="text-primary font-bold">128</span> LOGGED
        </div>
</div>
{/* Live Stream Controls */}
<div className="flex items-center gap-space-sm">
<div className="flex items-center bg-surface-container-lowest px-space-sm py-space-xs font-code-dense text-code-dense text-outline gap-space-xs">
<span>FILTER:</span>
<input className="bg-transparent border-none text-primary focus:outline-none w-32 placeholder:text-outline font-code-dense" placeholder="PATH OR PID..." type="text"/>
</div>
<button className="bg-surface hover:bg-surface-container text-on-surface px-space-sm py-space-xs font-label-sm text-label-sm uppercase transition-none" type="button">
          FREEZE
        </button>
<button className="bg-surface hover:bg-surface-container text-on-surface px-space-sm py-space-xs font-label-sm text-label-sm uppercase transition-none" type="button">
          PURGE LOG
        </button>
</div>
</div>
{/* Telemetry Table */}
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
<tbody className="divide-y-0 text-on-surface">
{/* Row 1 */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:31.284</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold">CREATE</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium truncate">
              src/App.jsx
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              node<span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 2 */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:32.019</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">MODIFY</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium truncate">
              src/index.js
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              node<span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 3 */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:33.102</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold">CREATE</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium truncate">
              src/utils/logger.js
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              node<span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 4: DELETE OPERATION */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:34.881</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-secondary-container text-tertiary font-label-sm text-label-sm font-bold">DELETE</span>
</td>
<td className="px-space-md py-space-xs font-mono text-secondary font-medium truncate">
              tmp/test.txt
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              rm<span className="text-outline">[PID:490]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 5 */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:36.221</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">MODIFY</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium truncate">
              package.json
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              npm<span className="text-outline">[PID:510]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 6 */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:42:39.102</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold">CREATE</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium truncate">
              src/components/Header.jsx
            </td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              node<span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-outline hover:text-primary-container uppercase" data-path="event-details" href="#">[DETAILS]</a>
</td>
</tr>
{/* Row 7: CRITICAL BLOCKED ACCESS */}
<tr className="group bg-surface-container-low hover:bg-surface-container transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:43:11.241</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-error-container text-error font-label-sm text-label-sm font-bold">ACCESS</span>
</td>
<td className="px-space-md py-space-xs font-mono text-error font-bold flex items-center gap-space-sm truncate">
<span>.ssh/id_rsa</span>
<span className="font-code-dense text-code-dense bg-error-container text-error px-space-xs uppercase">[BLOCKED]</span>
</td>
<td className="px-space-md py-space-xs font-mono text-error">
              cat<span className="text-on-error-container">[PID:602]</span>
<span className="font-code-dense text-code-dense block text-error truncate">SHIELDED INTERCEPT</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-error hover:text-tertiary uppercase font-bold" data-path="event-details" href="#">[EVT-000127]</a>
</td>
</tr>
{/* Row 8: SENSITIVE ACCESS */}
<tr className="group hover:bg-surface-container-high transition-none h-7">
<td className="px-space-md py-space-xs font-mono text-outline">10:43:12.008</td>
<td className="px-space-md py-space-xs">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-secondary font-label-sm text-label-sm font-bold">ACCESS</span>
</td>
<td className="px-space-md py-space-xs font-mono text-primary font-medium flex items-center gap-space-sm truncate">
<span>.env</span>
<span className="font-code-dense text-code-dense bg-surface-container text-secondary px-space-xs uppercase">[PROTECTED READ]</span>
</td>
<td className="px-space-md py-space-xs font-mono text-on-surface-variant">
              cat<span className="text-outline">[PID:602]</span>
<span className="font-code-dense text-code-dense text-outline"> [METADATA ONLY]</span>
</td>
<td className="px-space-md py-space-xs text-right">
<a className="font-code-dense text-code-dense text-primary-container hover:text-primary uppercase font-bold" data-path="event-details" href="#">[EVT-000128]</a>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer / Telemetry Pager */}
<div className="bg-surface-container-low px-space-md py-space-xs flex flex-wrap items-center justify-between text-outline font-code-dense text-code-dense">
<div className="flex items-center gap-space-md">
<span>SHOWING 8 OF 128 INODES</span>
<span>BUFFER: RING_PAGED_64K</span>
</div>
<div className="flex items-center gap-space-lg">
<span className="text-primary-container font-mono">AUTOSCROLL: ACTIVE</span>
<div className="flex items-center gap-space-xs">
<span className="cursor-pointer hover:text-primary">[|&lt;]</span>
<span className="cursor-pointer hover:text-primary">[&lt;]</span>
<span className="text-primary px-space-xs font-bold">1 / 16</span>
<span className="cursor-pointer hover:text-primary">[&gt;]</span>
<span className="cursor-pointer hover:text-primary">[&gt;|]</span>
</div>
</div>
</div>
</section>
{/* LOWER TECHNICAL DIAGNOSTIC / METRIC SPLIT */}
<section className="grid grid-cols-1 lg:grid-cols-3 bg-surface-container-highest">
{/* SUB-PANE 1: I/O OPERATIONS RATE (INLINE VECTOR SPARKLINE) */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">REALTIME I/O DENSITY</span>
<span className="font-code-dense text-code-dense text-primary-container">WINDOW: 60S</span>
</div>
<div className="my-space-md">
<svg className="w-full h-12 text-primary-container" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
<path d="M0,35 L20,32 L40,36 L60,20 L80,24 L100,12 L120,28 L140,5 L160,18 L180,2 L200,8" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
<line stroke="#353534" strokeWidth="0.5" x1="0" x2="200" y1="38" y2="38"></line>
</svg>
</div>
<div className="flex items-center justify-between font-code-dense text-code-dense text-outline">
<span>MIN: 0.2 OPS</span>
<span>PEAK: 12.8 OPS</span>
<span className="text-primary font-mono">NOW: 3.2 OPS</span>
</div>
</div>
{/* SUB-PANE 2: INTERCEPTED THREAT LOG */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">INTERCEPTION REPORT</span>
<span className="font-label-sm text-label-sm bg-error-container text-error px-space-xs font-bold">1 BLOCKED</span>
</div>
<div className="my-space-sm space-y-space-xs font-code-dense text-code-dense">
<div className="p-space-xs bg-surface-container text-error">
          [ALERT] PID:602 (cat) -&gt; .ssh/id_rsa
        </div>
<div className="p-space-xs bg-surface-container-lowest text-on-surface-variant truncate">
          RULE_MATCH: EXFILTRATION_PREVENTION_SIG_04
        </div>
</div>
<div className="flex items-center justify-between font-code-dense text-code-dense text-outline">
<span>POLICY: ZERO_EXFIL</span>
<span className="text-error font-mono">ACTION: EPERM_ISSUED</span>
</div>
</div>
{/* SUB-PANE 3: PROCESS TREE INTROSPECTION */}
<div className="bg-surface p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">ACTIVE PROCESS TREE</span>
<span className="font-code-dense text-code-dense text-outline">SANDBOX JAIL #1</span>
</div>
<div className="my-space-sm space-y-space-xs font-code-dense text-code-dense text-on-surface font-mono">
<div className="flex justify-between">
<span className="text-outline truncate">├─ systemd(1)</span>
<span className="text-outline">0.0% CPU</span>
</div>
<div className="flex justify-between">
<span className="text-primary truncate">│  └─ node[PID:412] server.js</span>
<span className="text-primary-container">1.4% CPU</span>
</div>
<div className="flex justify-between">
<span className="text-secondary truncate">│     └─ sh -c "cat .ssh/id_rsa"</span>
<span className="text-error">[KILLED]</span>
</div>
</div>
<div className="flex items-center justify-between font-code-dense text-code-dense text-outline">
<span>THREADS: 14</span>
<span className="text-primary">ISOLATION: CHROOT+SECCOMP</span>
</div>
</div>
</section>
      </div>
    </Layout>
  );
}
