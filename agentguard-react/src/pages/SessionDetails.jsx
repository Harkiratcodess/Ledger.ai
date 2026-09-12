import React from 'react';
import Layout from '../components/Layout';

export default function SessionDetails() {
  return (
    <Layout active="session-details">
      <div className="flex flex-col w-full">
{/* CONTEXT BANNER / ACTION TOOLBAR STRIP */}
<div className="w-full bg-surface-container-low border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">AUDIT CONSOLE // SESSION RUNTIME</span>
<span className="text-outline text-code-dense font-code-dense">[NODE: SG-DAEMON-LOCAL]</span>
</div>
<div className="flex items-baseline gap-space-md mt-space-xs">
<h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">AG-2026-001</h1>
<span className="font-label-md text-label-md text-primary-container px-space-xs py-[2px] bg-on-primary-fixed-variant/40 border border-primary-container uppercase">
          LIVE ATTACHED
        </span>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs">
        INSPECTING ACTIVE AGENT EXECUTION CONTEXT AND FILE AUDIT LEDGER
      </p>
</div>
{/* ACTION BAR */}
<div className="flex items-center flex-wrap gap-space-sm" id="action-strip">
<button className="h-9 px-space-md bg-surface border border-surface-container-highest text-on-surface font-label-md text-label-md hover:border-outline hover:text-primary transition-colors flex items-center gap-space-xs" id="pause-btn">
<span className="material-symbols-outlined text-[16px] text-primary-container">pause</span>
<span>PAUSE SESSION (MOCK)</span>
</button>
<button className="h-9 px-space-md bg-surface-container-lowest border border-error-container text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error transition-colors flex items-center gap-space-xs" id="terminate-btn">
<span className="material-symbols-outlined text-[16px]">dangerous</span>
<span>TERMINATE SESSION (MOCK)</span>
</button>
<button className="h-9 px-space-md bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors flex items-center gap-space-xs" id="export-btn">
<span className="material-symbols-outlined text-[16px]">file_download</span>
<span>EXPORT SESSION JSON</span>
</button>
</div>
</div>
{/* TOP METADATA GRID: 6 CLEAN DATA CELLS (BRUTALIST MATRIX) */}
<div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-surface-container-highest bg-surface-container-lowest">
{/* Cell 1: Status */}
<div className="p-space-md border-r border-b lg:border-b-0 border-surface-container-highest flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">STATUS</span>
<div className="flex items-center gap-space-sm mt-space-sm">
<span className="w-2.5 h-2.5 bg-primary-container animate-pulse-fast block"></span>
<span className="font-headline-sm text-headline-sm font-bold text-primary-container">ACTIVE</span>
</div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">IPC POLLING: 12ms</span>
</div>
{/* Cell 2: Container */}
<div className="p-space-md border-r border-b lg:border-b-0 border-surface-container-highest flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">CONTAINER</span>
<div className="font-body-lg text-body-lg text-primary font-bold mt-space-sm truncate" title="agentguard-sandbox-01">
        agentguard-sandbox-01
      </div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">ENGINE: RUNC-SEC</span>
</div>
{/* Cell 3: Project */}
<div className="p-space-md border-r border-b lg:border-b-0 border-surface-container-highest flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">PROJECT</span>
<div className="font-body-lg text-body-lg text-on-surface font-bold mt-space-sm truncate" title="demo-project">
        demo-project
      </div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">BRANCH: main (clean)</span>
</div>
{/* Cell 4: Project Path */}
<div className="p-space-md border-r border-b md:border-b-0 border-surface-container-highest flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">PROJECT PATH</span>
<div className="font-code-dense text-code-dense text-primary-container mt-space-sm truncate" title="/workspace/demo-project">
        /workspace/demo-project
      </div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">MOUNT: RW_ISOLATED</span>
</div>
{/* Cell 5: Started */}
<div className="p-space-md border-r border-surface-container-highest flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">STARTED</span>
<div className="font-body-lg text-body-lg text-on-surface mt-space-sm">
        10:38:12
      </div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">UTC OFFSET: +00:00</span>
</div>
{/* Cell 6: Duration */}
<div className="p-space-md flex flex-col justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">DURATION</span>
<div className="font-body-lg text-body-lg text-primary-container font-bold mt-space-sm" id="live-timer">
        00:04:19
      </div>
<span className="font-code-dense text-code-dense text-outline mt-space-xs">STATE: UNRESTRICTED</span>
</div>
</div>
{/* SECONDARY METADATA BAR (HIGH DENSITY LEDGER STRIP) */}
<div className="w-full bg-surface-container px-space-lg py-space-sm border-b border-surface-container-highest flex flex-wrap items-center justify-between text-label-sm font-label-sm uppercase gap-space-md">
<div className="flex items-center gap-space-xl flex-wrap">
<div className="flex items-center gap-space-xs">
<span className="text-on-surface-variant">TOTAL OPERATIONS:</span>
<span className="text-primary font-bold px-space-xs bg-surface-container-highest" id="op-counter">128</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="text-on-surface-variant">POLICY:</span>
<span className="text-primary-container font-bold flex items-center gap-[2px]">
<span className="w-1.5 h-1.5 bg-primary-container inline-block"></span>
          STRICT LOCAL
        </span>
</div>
<div className="flex items-center gap-space-xs">
<span className="text-on-surface-variant">THREAT LEVEL:</span>
<span className="text-primary-container font-bold bg-surface-container-lowest px-space-xs py-[1px] border border-surface-container-highest">
          NOMINAL
        </span>
</div>
<div className="flex items-center gap-space-xs">
<span className="text-on-surface-variant">ACTIVE PIDs:</span>
<div className="flex items-center gap-space-xs font-code-dense text-code-dense">
<span className="bg-surface-container-highest px-space-xs py-[2px] text-on-surface border border-outline-variant">412 (node)</span>
<span className="bg-surface-container-highest px-space-xs py-[2px] text-on-surface border border-outline-variant">510 (npm)</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-md text-code-dense font-code-dense text-outline">
<span>SANDBOX SYSCALL INTERCEPTION: ON</span>
<span>|</span>
<span>INODE SENSORS: 48</span>
</div>
</div>
{/* SECTION HEADING WITH BRUTALIST SUBBAR */}
<div className="w-full bg-surface-container-lowest border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-end justify-between gap-space-sm">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-primary-container font-label-sm text-label-sm tracking-widest uppercase">
<span>■</span>
<span>EVENT TELEMETRY FEED</span>
</div>
<h2 className="font-headline-lg text-headline-lg uppercase text-primary font-bold tracking-tight mt-space-xs">
        SESSION ACTIVITY
      </h2>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
        Filesystem operations recorded during session AG-2026-001
      </p>
</div>
{/* INTERACTION CONTROLS */}
<div className="flex items-center gap-space-sm">
<div className="flex items-center bg-surface border border-surface-container-highest px-space-sm py-space-xs text-label-sm font-label-sm">
<span className="text-on-surface-variant mr-space-xs">FILTER:</span>
<select className="bg-transparent text-primary outline-none cursor-pointer uppercase font-label-sm text-label-sm" id="op-filter">
<option className="bg-surface-container-low text-on-surface" value="ALL">ALL OPERATIONS (8)</option>
<option className="bg-surface-container-low text-on-surface" value="CREATE">CREATE</option>
<option className="bg-surface-container-low text-on-surface" value="MODIFY">MODIFY</option>
<option className="bg-surface-container-low text-on-surface" value="DELETE">DELETE</option>
<option className="bg-surface-container-low text-on-surface" value="ACCESS">ACCESS (SENSITIVE)</option>
</select>
</div>
<div className="flex items-center border border-surface-container-highest px-space-sm py-space-xs gap-space-xs bg-surface text-label-sm font-label-sm text-on-surface-variant">
<span className="w-2 h-2 bg-primary-container block"></span>
<span>STREAM SYNCED</span>
</div>
</div>
</div>
{/* MAIN DENSE BRUTALIST AUDIT TABLE */}
<div className="w-full overflow-x-auto bg-surface-container-lowest">
<table className="w-full border-collapse text-left" style={{tableLayout: 'fixed', minWidth: '860px'}}>
<thead>
<tr className="h-8 bg-surface-container border-b border-surface-container-highest text-label-sm font-label-sm text-on-surface-variant uppercase">
<th className="w-36 px-space-md border-r border-surface-container-highest font-bold">TIME</th>
<th className="w-32 px-space-md border-r border-surface-container-highest font-bold">OPERATION</th>
<th className="px-space-md border-r border-surface-container-highest font-bold">TARGET PATH</th>
<th className="w-48 px-space-md border-r border-surface-container-highest font-bold">PROCESS CONTEXT</th>
<th className="w-64 px-space-md font-bold">AUDIT INTEGRITY</th>
</tr>
</thead>
<tbody className="font-body-md text-body-md divide-y divide-surface-container-highest" id="telemetry-body">
{/* ROW 1 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="CREATE">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:31.284
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-primary font-bold border border-outline-variant">
              CREATE
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface font-code-dense text-code-dense truncate">
            src/App.jsx
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-primary-container">node</span><span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            SHA256: 89f0..a19c [OK]
          </td>
</tr>
{/* ROW 2 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="MODIFY">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:32.019
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-on-surface font-bold border border-surface-container-high">
              MODIFY
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface font-code-dense text-code-dense truncate">
            src/index.js
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-primary-container">node</span><span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            DIFF: +14 / -2 LNS
          </td>
</tr>
{/* ROW 3 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="CREATE">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:33.102
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-primary font-bold border border-outline-variant">
              CREATE
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface font-code-dense text-code-dense truncate">
            src/utils/logger.js
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-primary-container">node</span><span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            SHA256: 4e11..62bb [OK]
          </td>
</tr>
{/* ROW 4 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="DELETE">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:34.881
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-lowest text-secondary font-bold border border-error-container">
              DELETE
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense truncate line-through">
            tmp/test.txt
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-secondary">rm</span><span className="text-outline">[PID:490]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            UNLINK S_IFREG [OK]
          </td>
</tr>
{/* ROW 5 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="MODIFY">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:36.221
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-on-surface font-bold border border-surface-container-high">
              MODIFY
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface font-code-dense text-code-dense truncate">
            package.json
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-primary-container">npm</span><span className="text-outline">[PID:510]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            DIFF: +3 / -0 LNS
          </td>
</tr>
{/* ROW 6 */}
<tr className="h-8 hover:bg-surface-container transition-colors group cursor-pointer" data-op="CREATE">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline group-hover:text-on-surface flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-transparent group-hover:bg-primary-container block -ml-2 mr-1"></span>
            10:42:39.102
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-surface-container-highest text-primary font-bold border border-outline-variant">
              CREATE
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface font-code-dense text-code-dense truncate">
            src/components/Header.jsx
          </td>
<td className="px-space-md border-r border-surface-container-highest text-on-surface-variant font-code-dense text-code-dense">
<span className="text-primary-container">node</span><span className="text-outline">[PID:412]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-outline">
            SHA256: cc80..09ef [OK]
          </td>
</tr>
{/* ROW 7 (HIGH AUDIT LEVEL: .ssh/id_rsa) */}
<tr className="h-8 bg-error-container/10 hover:bg-error-container/20 transition-colors group cursor-pointer" data-op="ACCESS">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-error flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-error block -ml-2 mr-1"></span>
            10:43:11.241
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-secondary-container text-on-error font-bold border border-error">
              ACCESS
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-error font-bold truncate">
            .ssh/id_rsa
          </td>
<td className="px-space-md border-r border-surface-container-highest text-error font-code-dense text-code-dense">
<span>cat</span><span className="text-secondary">[PID:602]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-error font-bold flex items-center justify-between h-8">
<span>ACCESS METADATA RECORDED</span>
<span className="border border-error px-1 text-[9px] bg-error-container text-on-error uppercase font-label-sm">SENSITIVE</span>
</td>
</tr>
{/* ROW 8 (HIGH AUDIT LEVEL: .env) */}
<tr className="h-8 bg-error-container/10 hover:bg-error-container/20 transition-colors group cursor-pointer" data-op="ACCESS">
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-error flex items-center h-8 gap-space-xs">
<span className="w-1 h-3 bg-error block -ml-2 mr-1"></span>
            10:43:12.008
          </td>
<td className="px-space-md border-r border-surface-container-highest font-label-sm text-label-sm">
<span className="px-space-xs py-[2px] bg-secondary-container text-on-error font-bold border border-error">
              ACCESS
            </span>
</td>
<td className="px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-error font-bold truncate">
            .env
          </td>
<td className="px-space-md border-r border-surface-container-highest text-error font-code-dense text-code-dense">
<span>node</span><span className="text-secondary">[PID:412]</span>
</td>
<td className="px-space-md font-code-dense text-code-dense text-error font-bold flex items-center justify-between h-8">
<span>ACCESS METADATA RECORDED</span>
<span className="border border-error px-1 text-[9px] bg-error-container text-on-error uppercase font-label-sm">PROTECTED</span>
</td>
</tr>
</tbody>
</table>
</div>
{/* INSPECTION DRAWER & TELEMETRY FOOTER (SPLIT PANE DETAILS) */}
<div className="w-full border-t border-surface-container-highest grid grid-cols-1 lg:grid-cols-3 bg-surface-container-low">
{/* Left Pane: Live File Modification Sparkline & Stats */}
<div className="p-space-md border-b lg:border-b-0 lg:border-r border-surface-container-highest flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">FILESYSTEM PRESSURE METRICS</span>
<span className="font-code-dense text-code-dense text-primary-container">6.2 OPS/SEC</span>
</div>
{/* Inline Telemetry Sparkline Chart */}
<div className="mt-space-md">
<svg className="w-full h-12 text-primary-container" fill="none" preserveAspectRatio="none" viewBox="0 0 300 48">
<path d="M0 40 L30 38 L60 42 L90 28 L120 34 L150 14 L180 30 L210 24 L240 38 L270 4 L300 12" stroke="currentColor" strokeLinecap="square" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
<path d="M0 40 L30 38 L60 42 L90 28 L120 34 L150 14 L180 30 L210 24 L240 38 L270 4 L300 12 V 48 H 0 Z" fill="currentColor" fillOpacity="0.08"></path>
</svg>
</div>
</div>
<div className="grid grid-cols-3 gap-space-xs mt-space-md pt-space-xs border-t border-surface-container-highest text-code-dense font-code-dense">
<div>
<span className="text-outline block">WRITES:</span>
<span className="text-on-surface font-bold">4.8 MB</span>
</div>
<div>
<span className="text-outline block">READS:</span>
<span className="text-on-surface font-bold">18.2 MB</span>
</div>
<div>
<span className="text-outline block">LEAKS:</span>
<span className="text-primary-container font-bold">0 DETECTED</span>
</div>
</div>
</div>
{/* Middle Pane: Security Policy Active Enforcement */}
<div className="p-space-md border-b lg:border-b-0 lg:border-r border-surface-container-highest flex flex-col justify-between">
<div>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-space-xs">RUNTIME PERMISSIONS MAP</span>
<div className="flex flex-col gap-space-xs font-code-dense text-code-dense">
<div className="flex items-center justify-between p-space-xs bg-surface-container-lowest border border-surface-container-highest">
<span className="text-on-surface">NETWORK_SOCKETS</span>
<span className="text-outline uppercase">[BLOCKED]</span>
</div>
<div className="flex items-center justify-between p-space-xs bg-surface-container-lowest border border-surface-container-highest">
<span className="text-on-surface">RAW_CREDENTIAL_READ</span>
<span className="text-error uppercase font-bold">[INTERCEPTED]</span>
</div>
<div className="flex items-center justify-between p-space-xs bg-surface-container-lowest border border-surface-container-highest">
<span className="text-on-surface">EXEC_EXTERNAL_FORK</span>
<span className="text-primary-container uppercase font-bold">[MONITORED]</span>
</div>
</div>
</div>
<div className="font-label-sm text-label-sm text-outline mt-space-xs">
        RULESET: <span className="text-on-surface">SOC2-AGENT-STANDARD-V1.yaml</span>
</div>
</div>
{/* Right Pane: Terminal / Raw Stream Trace Output */}
<div className="p-space-md flex flex-col justify-between bg-surface-container-lowest">
<div>
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">RAW INODE TRACE</span>
<span className="font-code-dense text-code-dense text-outline">STDOUT // RAW</span>
</div>
<div className="font-code-dense text-code-dense text-outline-variant bg-surface-container p-space-xs h-20 overflow-y-auto flex flex-col gap-[2px]">
<div>[10:43:11] inotify_add_watch(4, "/workspace/demo-project/.ssh", IN_ACCESS) = 1</div>
<div className="text-error">[10:43:11] SYSCALL_WARN: openat(AT_FDCWD, ".ssh/id_rsa", O_RDONLY)</div>
<div className="text-error">[10:43:12] SYSCALL_WARN: openat(AT_FDCWD, ".env", O_RDONLY)</div>
<div className="text-primary-container">[10:43:13] HEARTBEAT_OK - NO WRITE TAMPERING OCCURRED</div>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs border-t border-surface-container-highest text-label-sm font-label-sm text-outline">
<span>INTERCEPTOR: EBPF_LSM</span>
<span className="text-primary-container">BUFFER: 100% OK</span>
</div>
</div>
</div>
{/* RAW JSON EXPORT MODAL SIMULATION / NOTIFICATION CONTAINER */}
<div className="hidden fixed bottom-space-lg right-space-lg z-50 bg-surface-container-highest border border-primary-container p-space-md text-on-surface shadow-lg max-w-sm" id="toast-banner">
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary font-bold">EXPORT GENERATED</span>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          Telemetry ledger downloaded as <span className="text-primary-container font-code-dense">session-AG-2026-001.json</span>
</p>
</div>
</div>
</div>
      </div>
    </Layout>
  );
}
