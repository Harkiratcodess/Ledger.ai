import React from 'react';
import Layout from '../components/Layout';

export default function Filesystem() {
  return (
    <Layout active="filesystem-activity">
      <div className="flex flex-col w-full">
{/* Sub-Header Status Strip */}
<div className="w-full bg-surface-container-lowest p-space-md flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-highest">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
<span>SUBSYSTEM: VFS-WATCHER</span>
<span>//</span>
<span className="text-primary-container">INODE_TRACE_ACTIVE</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
        FILESYSTEM <span className="text-on-surface-variant font-headline-lg text-headline-lg">ACTIVITY MONITOR</span>
</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider mt-1">
        COMPLETE CHRONOLOGICAL AUDIT TRAIL OF WORKSPACE FILE OPERATIONS
      </p>
</div>
{/* Live Buffer Telemetry Sparkline Pill */}
<div className="flex items-center gap-space-lg bg-surface-container p-space-sm border border-surface-container-highest">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">IOPS / SEC</span>
<span className="font-headline-sm text-headline-sm text-primary font-bold">42.8 ops/s</span>
</div>
<div className="h-8 w-24 flex items-end gap-0.5 px-1 py-0.5 bg-surface-container-lowest border border-surface-container-highest">
<span className="w-1 bg-primary-container h-2"></span>
<span className="w-1 bg-primary-container h-3"></span>
<span className="w-1 bg-primary-container h-5"></span>
<span className="w-1 bg-primary-container h-2"></span>
<span className="w-1 bg-primary-container h-7"></span>
<span className="w-1 bg-primary-container h-4"></span>
<span className="w-1 bg-primary-container h-6"></span>
<span className="w-1 bg-secondary-container h-8"></span>
<span className="w-1 bg-primary-container h-5"></span>
<span className="w-1 bg-primary-container h-3"></span>
</div>
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm text-outline uppercase">SYS STATUS</span>
<span className="font-code-dense text-code-dense text-primary-container uppercase font-bold">[SYNCED]</span>
</div>
</div>
</div>
{/* Top Statistics Bar (4 Brutalist Rectangular Metric Tiles) */}
<div className="grid grid-cols-2 lg:grid-cols-4 w-full border-b border-surface-container-highest bg-surface-container-lowest">
{/* Total Events */}
<div className="p-space-md bg-surface-container-low border-r border-b lg:border-b-0 border-surface-container-highest flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">TOTAL EVENTS</span>
<span className="font-code-dense text-code-dense text-on-surface-variant font-bold">EVT:ALL</span>
</div>
<div className="flex items-baseline gap-space-sm mt-space-sm">
<span className="font-headline-xl text-headline-xl text-primary font-bold">128</span>
<span className="font-body-sm text-body-sm text-outline">RECORDS</span>
</div>
<div className="mt-space-xs flex items-center justify-between text-outline font-code-dense text-code-dense">
<span>MEM 1.24 MB</span>
<span className="text-primary-container">CAP 100%</span>
</div>
</div>
{/* Created */}
<div className="p-space-md bg-surface-container-low border-r-0 md:border-r border-b lg:border-b-0 border-surface-container-highest flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">CREATED</span>
<span className="font-code-dense text-code-dense text-primary-container font-bold">+WRITE</span>
</div>
<div className="flex items-baseline gap-space-sm mt-space-sm">
<span className="font-headline-xl text-headline-xl text-primary font-bold">31</span>
<span className="font-body-sm text-body-sm text-primary-container">FILES (+7.4KB)</span>
</div>
<div className="mt-space-xs flex items-center justify-between text-outline font-code-dense text-code-dense">
<span>24.2% SHARE</span>
<span className="text-on-surface">SANDBOX DIR</span>
</div>
</div>
{/* Modified */}
<div className="p-space-md bg-surface-container-low border-r border-surface-container-highest flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">MODIFIED</span>
<span className="font-code-dense text-code-dense text-on-surface font-bold">~MUTATE</span>
</div>
<div className="flex items-baseline gap-space-sm mt-space-sm">
<span className="font-headline-xl text-headline-xl text-primary font-bold">76</span>
<span className="font-body-sm text-body-sm text-outline">DIFFS</span>
</div>
<div className="mt-space-xs flex items-center justify-between text-outline font-code-dense text-code-dense">
<span>59.3% SHARE</span>
<span className="text-on-surface">AUTO-APPLY</span>
</div>
</div>
{/* Deleted */}
<div className="p-space-md bg-surface-container-low flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">DELETED</span>
<span className="font-code-dense text-code-dense text-secondary font-bold">!UNLINK</span>
</div>
<div className="flex items-baseline gap-space-sm mt-space-sm">
<span className="font-headline-xl text-headline-xl text-secondary font-bold">21</span>
<span className="font-body-sm text-body-sm text-secondary">PURGED</span>
</div>
<div className="mt-space-xs flex items-center justify-between text-outline font-code-dense text-code-dense">
<span>16.5% SHARE</span>
<span className="text-secondary font-bold">HIGH RISK VEC</span>
</div>
</div>
</div>
{/* Interactive Control Bar */}
<div className="w-full bg-surface-container-lowest border-b border-surface-container-highest p-space-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-sm">
{/* Filter Toggle Buttons (0px radius brutalist pill tabs) */}
<div className="flex flex-wrap items-center gap-px bg-surface-container-highest border border-surface-container-highest">
<button className="filter-btn active-filter px-space-md py-1.5 font-label-md text-label-md tracking-wider bg-surface-container-lowest text-primary-container border-l-2 border-primary-container uppercase transition-all" data-filter="all">
        ALL (128)
      </button>
<button className="filter-btn px-space-md py-1.5 font-label-md text-label-md tracking-wider bg-surface-container-low text-outline uppercase hover:text-on-surface hover:bg-surface-container transition-all" data-filter="create">
        CREATE (31)
      </button>
<button className="filter-btn px-space-md py-1.5 font-label-md text-label-md tracking-wider bg-surface-container-low text-outline uppercase hover:text-on-surface hover:bg-surface-container transition-all" data-filter="modify">
        MODIFY (76)
      </button>
<button className="filter-btn px-space-md py-1.5 font-label-md text-label-md tracking-wider bg-surface-container-low text-outline uppercase hover:text-on-surface hover:bg-surface-container transition-all" data-filter="delete">
        DELETE (21)
      </button>
<button className="filter-btn px-space-md py-1.5 font-label-md text-label-md tracking-wider bg-surface-container-low text-secondary uppercase hover:bg-surface-container transition-all flex items-center gap-1" data-filter="sensitive">
<span className="material-symbols-outlined text-[12px] leading-none">shield</span>
        SENSITIVE (2)
      </button>
</div>
{/* Search Input and Action Export */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
<div className="relative flex-grow sm:w-80">
<span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
<input className="w-full bg-surface-container-lowest border border-surface-container-highest pl-8 pr- space-sm py-1.5 text-on-surface font-code-dense text-code-dense uppercase tracking-wider focus:outline-none focus:border-primary-container placeholder:text-outline" id="path-search-input" placeholder="SEARCH PATH... (e.g. src/, .env, *.js)" type="text"/>
</div>
<div className="flex items-center gap-px">
<button className="bg-surface-container-low hover:bg-surface-container border border-surface-container-highest px-space-md py-1.5 font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-space-xs transition-colors" id="export-tsv-btn" title="Download snapshot audit stream">
<span className="material-symbols-outlined text-[14px]">download</span>
          [ EXPORT AUDIT TSV ]
        </button>
<button className="bg-surface-container-low hover:bg-surface-container border border-surface-container-highest px-space-sm py-1.5 font-label-md text-label-md text-primary-container uppercase tracking-wider transition-colors" id="auto-scroll-toggle" title="Lock autoscroll to latest trace">
          LIVE
        </button>
</div>
</div>
</div>
{/* Main Event Table */}
<div className="w-full overflow-x-auto bg-surface-container-lowest">
<table className="w-full text-left border-collapse table-fixed min-w-[960px]">
<thead className="bg-surface-container-low border-b border-surface-container-highest sticky top-0 z-10 select-none">
<tr className="font-headline-sm text-[11px] text-outline uppercase tracking-wider">
<th className="w-36 py-2 px-space-md border-r border-surface-container-highest">TIMESTAMP</th>
<th className="w-28 py-2 px-space-md border-r border-surface-container-highest">OPERATION</th>
<th className="py-2 px-space-md border-r border-surface-container-highest">PATH</th>
<th className="w-28 py-2 px-space-md border-r border-surface-container-highest text-right">SIZE DELTA</th>
<th className="w-56 py-2 px-space-md border-r border-surface-container-highest">TRIGGERING PROCESS</th>
<th className="w-28 py-2 px-space-md text-center">ACTION</th>
</tr>
</thead>
<tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-container-highest" id="fs-audit-tbody">
{/* Row 1: EVT-000128 (Highlighted active cursor row) */}
<tr className="audit-row group bg-surface-container cursor-pointer transition-colors border-l-2 border-primary-container" data-id="EVT-000128" data-op="create" data-path="src/App.jsx">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:31.284
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-primary-container">
<span className="inline-block px-1 py-0.5 border border-primary-container/40 bg-primary-container/10">CREATE</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="font-semibold text-primary truncate">src/App.jsx</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488102</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-primary-container font-semibold">
            +1.4 KB
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface font-medium">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000128">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 2 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000127" data-op="modify" data-path="src/index.js">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:32.019
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-on-surface">
<span className="inline-block px-1 py-0.5 border border-surface-container-highest bg-surface-container">MODIFY</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="text-on-surface truncate">src/index.js</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488091</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-on-surface font-semibold">
            +240 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000127">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 3 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000126" data-op="create" data-path="src/utils/logger.js">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:33.102
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-primary-container">
<span className="inline-block px-1 py-0.5 border border-primary-container/40 bg-primary-container/10">CREATE</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="text-on-surface truncate">src/utils/logger.js</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488210</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-primary-container font-semibold">
            +890 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000126">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 4: DELETED IN DANGER RED */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors bg-secondary-container/5" data-id="EVT-000125" data-op="delete" data-path="tmp/test.txt">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:34.881
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-secondary">
<span className="inline-block px-1 py-0.5 border border-secondary-container bg-secondary-container/20">[!] DELETE</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-secondary flex items-center justify-between line-through">
<span className="truncate">tmp/test.txt</span>
<span className="text-[9px] text-secondary tracking-wider font-code-dense no-underline">[UNLINKED]</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-secondary font-semibold">
            -120 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-secondary truncate">
<span className="font-bold">rm</span>
<span className="text-outline text-[9px] ml-1">[PID:5002]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-secondary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-secondary hover:bg-secondary-container hover:text-white uppercase transition-all" href="/event/EVT-000125">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 5 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000124" data-op="modify" data-path="package.json">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:36.221
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-on-surface">
<span className="inline-block px-1 py-0.5 border border-surface-container-highest bg-surface-container">MODIFY</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="truncate">package.json</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#487912</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-on-surface font-semibold">
            +48 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">npm install</span>
<span className="text-outline text-[9px] ml-1">[PID:5044]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000124">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 6 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000123" data-op="create" data-path="src/components/Header.jsx">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:42:39.102
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-primary-container">
<span className="inline-block px-1 py-0.5 border border-primary-container/40 bg-primary-container/10">CREATE</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="truncate">src/components/Header.jsx</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488350</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-primary-container font-semibold">
            +3.2 KB
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000123">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 7: SENSITIVE ACCESS (SSH KEY) */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors bg-surface-container-low" data-id="EVT-000122" data-op="sensitive" data-path=".ssh/id_rsa">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:43:11.241
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-secondary">
<span className="inline-flex items-center gap-0.5 px-1 py-0.5 border border-secondary-container bg-secondary-container/20">
<span className="material-symbols-outlined text-[10px]">lock</span>
              ACCESS
            </span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense flex items-center justify-between">
<div className="flex items-center gap-space-sm truncate">
<span className="text-secondary font-bold truncate">.ssh/id_rsa</span>
<span className="border border-secondary px-1 text-[9px] text-secondary uppercase font-bold tracking-widest bg-secondary-container/10">SENSITIVE: REDACTED</span>
</div>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">NO-PREVIEW</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-outline">
            0 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-secondary font-medium truncate">
            bash (cat)
            <span className="text-outline text-[9px] ml-1">[PID:5129]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-secondary bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-secondary hover:bg-secondary hover:text-surface-container-lowest uppercase transition-all" href="/event/EVT-000122">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 8: SENSITIVE ACCESS (.ENV) */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors bg-surface-container-low" data-id="EVT-000121" data-op="sensitive" data-path=".env">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:43:12.008
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-secondary">
<span className="inline-flex items-center gap-0.5 px-1 py-0.5 border border-secondary-container bg-secondary-container/20">
<span className="material-symbols-outlined text-[10px]">lock</span>
              ACCESS
            </span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense flex items-center justify-between">
<div className="flex items-center gap-space-sm truncate">
<span className="text-secondary font-bold truncate">.env</span>
<span className="border border-secondary px-1 text-[9px] text-secondary uppercase font-bold tracking-widest bg-secondary-container/10">SENSITIVE: REDACTED</span>
</div>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">NO-PREVIEW</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-outline">
            0 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-secondary font-medium truncate">
            node (dotenv)
            <span className="text-outline text-[9px] ml-1">[PID:5130]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-secondary bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-secondary hover:bg-secondary hover:text-surface-container-lowest uppercase transition-all" href="/event/EVT-000121">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 9 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000120" data-op="modify" data-path="src/utils.js">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:43:15.890
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-on-surface">
<span className="inline-block px-1 py-0.5 border border-surface-container-highest bg-surface-container">MODIFY</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="truncate">src/utils.js</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488119</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-on-surface font-semibold">
            +410 B
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000120">
              [INSPECT]
            </a>
</td>
</tr>
{/* Row 10 */}
<tr className="audit-row group hover:bg-surface-container cursor-pointer transition-colors" data-id="EVT-000119" data-op="create" data-path="tests/app.test.js">
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-outline">
            10:43:18.112
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-label-sm text-label-sm font-bold text-primary-container">
<span className="inline-block px-1 py-0.5 border border-primary-container/40 bg-primary-container/10">CREATE</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface flex items-center justify-between">
<span className="truncate">tests/app.test.js</span>
<span className="text-[9px] text-outline tracking-wider font-code-dense hidden group-hover:inline">INODE#488401</span>
</td>
<td className="py-2 px-space-md border-r border-surface-container-highest text-right font-code-dense text-code-dense text-primary-container font-semibold">
            +1.8 KB
          </td>
<td className="py-2 px-space-md border-r border-surface-container-highest font-code-dense text-code-dense text-on-surface-variant truncate">
<span className="text-on-surface">agent-worker:node</span>
<span className="text-outline text-[9px] ml-1">[PID:4921]</span>
</td>
<td className="py-2 px-space-md text-center">
<a className="inline-block border border-surface-container-highest group-hover:border-primary-container bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-on-surface group-hover:text-primary-container uppercase transition-all" href="/event/EVT-000119">
              [INSPECT]
            </a>
</td>
</tr>
</tbody>
</table>
</div>
{/* Bottom Pagination & Brutalist Status Rail */}
<div className="w-full bg-surface-container-low border-t border-surface-container-highest p-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-code-dense text-code-dense">
<div className="flex items-center gap-space-md text-on-surface-variant">
<div className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 bg-primary-container"></span>
<span className="font-bold text-on-surface">SHOWING 10 OF 128 EVENTS</span>
</div>
<span className="text-outline">|</span>
<span>BUFFER: <strong className="text-primary-container">100% IN-MEMORY</strong></span>
<span className="text-outline">|</span>
<span className="text-on-surface uppercase">ZERO CLOUD TRANSMISSION</span>
</div>
{/* Pagination Controls */}
<div className="flex items-center gap-px bg-surface-container-highest border border-surface-container-highest">
<button className="px-space-md py-1 bg-surface-container-lowest hover:bg-surface-container text-outline hover:text-on-surface uppercase transition-colors" disabled={true}>
        [ PREV ]
      </button>
<div className="px-space-md py-1 bg-surface-container-low text-primary-container font-bold border-x border-surface-container-highest">
        01 / 13
      </div>
<button className="px-space-md py-1 bg-surface-container-lowest hover:bg-surface-container text-on-surface uppercase transition-colors">
        [ NEXT ]
      </button>
</div>
</div>
{/* Toast Notification Overlay (TSV Export / Action Feedback) */}
<div className="fixed bottom-6 right-6 bg-surface-container-lowest border border-primary-container p-space-md shadow-2xl flex items-center gap-space-md translate-y-24 opacity-0 transition-all duration-200 z-50" id="toast-notify">
<span className="w-2 h-2 bg-primary-container"></span>
<div className="flex flex-col font-code-dense text-code-dense">
<span className="font-bold text-primary-container uppercase">AUDIT LOG EXPORTED</span>
<span className="text-on-surface">RAW_EVENTS_128.TSV GENERATED LOCALLY</span>
</div>
</div>
{/* Micro-interactions Script */}
      </div>
    </Layout>
  );
}
