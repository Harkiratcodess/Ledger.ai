import React from 'react';
import Layout from '../components/Layout';

export default function EmptyState() {
  return (
    <Layout active="empty-state">
      <div className="flex flex-col w-full">
<div className="flex flex-col w-full bg-surface-container-lowest">
{/* Top Telemetry Ribbon */}
<div className="flex flex-wrap items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-surface-container-highest">
<div className="flex items-center gap-space-md">
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">FILESYSTEM WATCHER</span>
<span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">SUBSYSTEM: VFS_INODE_TRACE</span>
</div>
<div className="h-6 w-px bg-surface-container-highest mx-space-xs"></div>
<div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-sm py-space-xs border border-surface-container-highest">
<span className="w-2 h-2 bg-primary-container inline-block animate-pulse-fast"></span>
<span className="font-label-md text-label-md uppercase text-primary-container tracking-wider font-bold">ACTIVE</span>
</div>
</div>
<div className="flex items-center gap-space-xl">
<div className="flex items-center gap-space-sm font-code-dense text-code-dense text-outline">
<span>UPTIME:</span>
<span className="text-on-surface" id="uptime-counter">00:04:18.92</span>
</div>
<div className="flex items-center gap-space-sm font-code-dense text-code-dense text-outline">
<span>POLL_FREQ:</span>
<span className="text-on-surface">1000HZ [REALTIME]</span>
</div>
<div className="flex items-center gap-space-sm font-code-dense text-code-dense text-outline">
<span>FILTER:</span>
<span className="text-primary-container">UNMASKED [ALL]</span>
</div>
</div>
</div>
{/* Main Operational Surface */}
<div className="p-space-lg flex flex-col gap-space-lg">
{/* Central Empty / Waiting Display Terminal */}
<div className="w-full bg-[#0B0B0B] border border-[#292929] flex flex-col">
{/* Terminal Header Bar */}
<div className="bg-[#101010] border-b border-[#292929] px-space-md py-space-sm flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-1.5 h-1.5 bg-[#858585]"></span>
<span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">DAEMON STATUS // INODE MONITOR: READY</span>
</div>
<div className="flex items-center gap-space-md font-code-dense text-code-dense text-outline">
<span>PID: 88412</span>
<span>MEM: 18.4MB</span>
<span>CTX: KERNEL_WATCH</span>
</div>
</div>
{/* Terminal Body */}
<div className="p-space-xl flex flex-col items-center justify-center text-center py-16">
<div className="flex items-center gap-space-sm mb-space-sm">
<span className="font-headline-lg text-headline-lg text-primary tracking-tight uppercase">WAITING FOR ACTIVITY</span>
<span className="w-2.5 h-4 bg-primary-container inline-block animate-pulse-fast"></span>
</div>
<div className="font-body-md text-body-md text-outline max-w-xl flex flex-col gap-1 mb-space-xl">
<p>The sandbox is running.</p>
<p>Filesystem events will appear here when detected.</p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-md">
<button className="bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider px-space-md py-space-sm hover:bg-primary transition-colors focus:outline-none flex items-center gap-space-sm cursor-pointer" id="simulate-btn" type="button">
<span className="font-code-dense text-code-dense font-bold">[</span>
<span>SIMULATE TEST TOUCH EVENT</span>
<span className="font-code-dense text-code-dense font-bold">]</span>
</button>
<button className="bg-[#0B0B0B] border border-[#292929] text-outline font-label-md text-label-md uppercase tracking-wider px-space-md py-space-sm hover:text-on-surface hover:border-[#858585] transition-colors focus:outline-none" id="clear-log-btn" type="button">
              RESET BUFFER
            </button>
</div>
</div>
{/* Ephemeral Live Stream Event Display (Populates on simulation) */}
<div className="border-t border-[#292929] bg-[#050505] p-space-md hidden flex-col font-code-dense text-code-dense" id="simulation-stream">
<div className="text-outline uppercase tracking-wider pb-space-xs border-b border-[#292929] flex justify-between mb-space-xs">
<span>EVENT DUMP (TRANSIENT CACHE)</span>
<span className="text-primary-container" id="stream-count">0 EVENTS DETECTED</span>
</div>
<div className="flex flex-col gap-1 max-h-40 overflow-y-auto" id="stream-log-rows"></div>
</div>
</div>
{/* Bottom Split Matrix: Diagnostics & Sub-Details Panel */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-[#292929]">
{/* Sub-details Table (8 Cols) */}
<div className="lg:col-span-8 bg-[#0B0B0B] flex flex-col border-b lg:border-b-0 lg:border-r border-[#292929]">
<div className="bg-[#101010] border-b border-[#292929] px-space-md py-space-sm flex items-center justify-between">
<span className="font-label-md text-label-md text-outline uppercase tracking-wider">RUNTIME DIAGNOSTIC BINDINGS</span>
<span className="font-code-dense text-code-dense text-primary-container uppercase">SYSCALL: FANOTIFY_FS</span>
</div>
<div className="divide-y divide-[#292929] font-code-dense text-code-dense">
<div className="px-space-md py-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<span className="text-outline uppercase">SANDBOX STATUS:</span>
<div className="flex items-center gap-space-sm">
<span className="text-primary-container font-bold">RUNNING</span>
<span className="text-on-surface-variant">(agentguard-sandbox-01)</span>
</div>
</div>
<div className="px-space-md py-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<span className="text-outline uppercase">TARGET MOUNT:</span>
<span className="text-on-surface font-bold">/workspace/demo-project</span>
</div>
<div className="px-space-md py-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<span className="text-outline uppercase">FS WATCH ENGINE:</span>
<div className="flex items-center gap-space-xs">
<span className="text-on-surface">chokidar v3.6</span>
<span className="text-outline">(eBPF fallback armed)</span>
</div>
</div>
<div className="px-space-md py-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<span className="text-outline uppercase">QUEUE DEPTH:</span>
<span className="text-primary-container font-bold" id="queue-depth-val">0 EVENTS PENDING</span>
</div>
<div className="px-space-md py-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<span className="text-outline uppercase">LISTENING SOCKET:</span>
<span className="text-on-surface">IPC LOCALHOST:9091</span>
</div>
</div>
</div>
{/* Engine Telemetry / Health Vector (4 Cols) */}
<div className="lg:col-span-4 bg-[#050505] flex flex-col justify-between">
<div>
<div className="bg-[#101010] border-b border-[#292929] px-space-md py-space-sm flex items-center justify-between">
<span className="font-label-md text-label-md text-outline uppercase tracking-wider">INODE SUBSYSTEM MAP</span>
<span className="font-code-dense text-code-dense text-outline">SEC_LEV: 0</span>
</div>
<div className="p-space-md flex flex-col gap-space-md font-code-dense text-code-dense">
<div className="flex flex-col gap-space-xs">
<div className="flex justify-between text-outline">
<span>FD LEAK PROBE:</span>
<span className="text-primary-container">OK (0 POOL DRIFT)</span>
</div>
<div className="w-full bg-[#1c1b1b] h-1">
<div className="bg-primary-container h-1 w-[2%]"></div>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<div className="flex justify-between text-outline">
<span>NOTIFY BACKPRESSURE:</span>
<span className="text-on-surface">0.00%</span>
</div>
<div className="w-full bg-[#1c1b1b] h-1">
<div className="bg-primary-container h-1 w-0"></div>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<div className="flex justify-between text-outline">
<span>AUDIT TRACE VECTOR:</span>
<span className="text-on-surface">DIRECT_PASS</span>
</div>
<div className="text-outline text-code-dense">
                  SYS_NOTIFY: ENABLED<br/>
                  RECURSIVE_DEPTH: INF<br/>
                  AT_FDCWD: RESOLVED
                </div>
</div>
</div>
</div>
<div className="p-space-md border-t border-[#292929] bg-[#0E0E0E] flex items-center justify-between font-label-sm text-label-sm text-outline">
<span>ISOLATION: SECCOMP-BPF</span>
<span className="text-primary-container">RIGID</span>
</div>
</div>
</div>
</div>
</div>
      </div>
    </Layout>
  );
}
