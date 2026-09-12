import React from 'react';
import Layout from '../components/Layout';

export default function Settings() {
  return (
    <Layout active="settings-privacy">
      <div className="flex flex-col w-full">
<div className="flex flex-col w-full bg-[#050505] min-h-[calc(100vh-4rem)] text-on-surface select-none">
{/* Top Action / Context Header Bar */}
<div className="w-full bg-[#0B0B0B] border-b border-[#292929] px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 bg-primary-container inline-block"></span>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold uppercase">SETTINGS</h1>
<span className="font-code-dense text-code-dense text-outline px-space-xs py-[2px] bg-surface-container-lowest border border-[#292929] uppercase">CFG_REV_2025.04.12</span>
</div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-space-xs">LOCAL-FIRST CONFIGURATION &amp; PRIVACY ASSURANCE</span>
</div>
<div className="flex items-center gap-space-md">
<div className="flex items-center gap-space-xs font-code-dense text-code-dense px-space-sm py-space-xs bg-[#050505] border border-[#292929] text-outline">
<span className="text-primary-container">SYS_PERM:</span>
<span className="text-primary uppercase">STRICT_ZERO_EGRESS</span>
</div>
<button className="px-space-md py-space-xs bg-[#0B0B0B] border border-[#292929] hover:border-outline text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors" id="btnSaveState">
          EXPORT CONFIG [.JSON]
        </button>
</div>
</div>
{/* Main Grid Matrix */}
<div className="grid grid-cols-1 xl:grid-cols-12 w-full">
{/* Left Column: Primary Sections (General + Privacy) */}
<div className="xl:col-span-7 flex flex-col xl:border-r border-[#292929]">
{/* SECTION 1: GENERAL */}
<section className="border-b border-[#292929] bg-[#0B0B0B]">
<div className="flex items-center justify-between px-space-lg py-space-sm bg-[#101010] border-b border-[#292929]">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-outline font-bold">01 //</span>
<span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">GENERAL RUNTIME CONFIGURATION</span>
</div>
<span className="font-code-dense text-code-dense text-on-surface-variant uppercase">[SUBSYSTEM: CORE]</span>
</div>
<div className="divide-y divide-[#292929]">
{/* Row: Session Retention */}
<div className="p-space-lg flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">SESSION RETENTION</span>
<span className="font-label-sm text-label-sm uppercase px-space-xs py-[2px] bg-[#050505] border border-[#292929] text-primary">IMMUTABLE_EPHEMERAL</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Local only (Logs retained in local sqlite/json buffer, purged on user command). No persistent historical snapshots are written to non-volatile secondary media without explicit invocation.
              </p>
<div className="mt-space-xs flex items-center gap-space-md font-code-dense text-code-dense text-outline">
<span>BUFFER_ENGINE: <span className="text-primary-container">SQLITE3_WAL (MEM)</span></span>
<span>CIPHER: <span className="text-primary">XCHACHA20-POLY1305</span></span>
</div>
</div>
{/* Row: Log Rotation Limit */}
<div className="p-space-lg flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">LOG ROTATION LIMIT</span>
<span className="font-code-dense text-code-dense text-primary-container">10,000 / 10,000 CAP</span>
</div>
<div className="flex items-center gap-space-md">
<div className="flex-1 bg-[#050505] border border-[#292929] h-3 relative overflow-hidden">
<div className="bg-primary-container h-full w-[42%]"></div>
</div>
<span className="font-code-dense text-code-dense text-on-surface-variant shrink-0">4,218 ALLOCATED</span>
</div>
<p className="font-body-sm text-body-sm text-outline">
                10,000 events per session (FIFO in-memory buffer). Upon buffer overflow, oldest recorded execution frames are dropped cyclically without disk swapping.
              </p>
</div>
{/* Row: Daemon Bind Port */}
<div className="p-space-lg flex items-center justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">DAEMON BIND PORT</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Host socket interface binding boundary. External interface routing rejected.</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-code-dense text-code-dense bg-[#050505] border border-primary-container text-primary-container px-space-md py-space-xs font-bold tracking-widest">
                  127.0.0.1:9091
                </span>
<span className="font-label-sm text-label-sm text-outline px-space-xs py-space-xs bg-[#050505] border border-[#292929]">LOOPBACK ONLY</span>
</div>
</div>
</div>
</section>
{/* SECTION 2: PRIVACY & TELEMETRY */}
<section className="border-b border-[#292929] xl:border-b-0 bg-[#0B0B0B]">
<div className="flex items-center justify-between px-space-lg py-space-sm bg-[#101010] border-b border-[#292929]">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-outline font-bold">02 //</span>
<span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">PRIVACY &amp; TELEMETRY GOVERNANCE</span>
</div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-container font-bold flex items-center gap-space-xs">
<span className="w-1.5 h-1.5 bg-primary-container inline-block"></span> ZERO LEAKAGE VERIFIED
            </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#292929] border-b border-[#292929]">
{/* Telemetry Status Box */}
<div className="p-space-lg flex flex-col justify-between gap-space-md bg-[#0B0B0B]">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">TELEMETRY</span>
<span className="font-body-sm text-body-sm text-outline">Diagnostic phone-home payloads, usage analytics, crash reporting pipelines.</span>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-[#292929]">
<span className="font-code-dense text-code-dense text-on-surface-variant">CURRENT_POLICY:</span>
<div className="flex items-center border border-[#292929] bg-[#050505]">
<span className="px-space-sm py-[2px] bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold">DISABLED</span>
<span className="px-space-sm py-[2px] text-outline font-label-sm text-label-sm opacity-40">ENABLE</span>
</div>
</div>
</div>
{/* External API Calls */}
<div className="p-space-lg flex flex-col justify-between gap-space-md bg-[#0B0B0B]">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">EXTERNAL API CALLS</span>
<span className="font-body-sm text-body-sm text-outline">Dynamic resolution of threat feeds, signature downloads, cloud intelligence.</span>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-[#292929]">
<span className="font-code-dense text-code-dense text-on-surface-variant">EGRESS_RULE:</span>
<span className="font-label-sm text-label-sm uppercase px-space-sm py-[2px] bg-[#050505] border border-primary-container text-primary-container font-bold">
                  DISABLED (ZERO OUTBOUND TRAFFIC)
                </span>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#292929]">
{/* Data Processing Boundary */}
<div className="p-space-lg flex flex-col justify-between gap-space-md bg-[#0B0B0B]">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">DATA PROCESSING</span>
<span className="font-body-sm text-body-sm text-outline">Instruction disassembly, AST tree extraction, and regex token evaluation boundary.</span>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-[#292929]">
<span className="font-code-dense text-code-dense text-on-surface-variant">COMPUTE_DOMAIN:</span>
<span className="font-code-dense text-code-dense text-primary font-bold tracking-wider">LOCAL MACHINE ONLY</span>
</div>
</div>
{/* AI Call Monitoring */}
<div className="p-space-lg flex flex-col justify-between gap-space-md bg-[#0B0B0B]">
<div className="flex flex-col gap-space-xs">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">AI CALL MONITORING</span>
<span className="font-body-sm text-body-sm text-outline">Interception layer evaluating model prompts, system directives, and completions.</span>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-[#292929]">
<span className="font-code-dense text-code-dense text-on-surface-variant">INFERENCE_AUDIT:</span>
<span className="font-label-sm text-label-sm uppercase text-primary tracking-tight">LOCAL INSPECTION ONLY</span>
</div>
</div>
</div>
<div className="p-space-md bg-[#101010] border-t border-[#292929] flex items-center justify-between">
<span className="font-code-dense text-code-dense text-outline">SEC_HASH_VALIDATION: 9e8a71c...04bfa (LOCAL_ISOLATION_ACKNOWLEDGED)</span>
<span className="font-code-dense text-code-dense text-primary-container uppercase font-bold">NO 3RD-PARTY LLM EVALUATION</span>
</div>
</section>
</div>
{/* Right Column: Sections 3 & 4 (Sensitive Paths & Audit Buffer) */}
<div className="xl:col-span-5 flex flex-col bg-[#0B0B0B]">
{/* SECTION 3: SENSITIVE PATH PROTECTION */}
<section className="border-b border-[#292929]">
<div className="flex items-center justify-between px-space-lg py-space-sm bg-[#101010] border-b border-[#292929]">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-outline font-bold">03 //</span>
<span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">SENSITIVE PATHS SHIELD</span>
</div>
<span className="font-code-dense text-code-dense px-space-xs py-[2px] bg-primary-container text-on-primary-fixed font-bold">ACTIVE_ENFORCED</span>
</div>
<div className="p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">PROTECTED PATTERNS [EXCLUSION LIST]</span>
<span className="font-code-dense text-code-dense text-outline">6 GLOB_RULES LOADED</span>
</div>
{/* Path Pattern Matrix Grid */}
<div className="grid grid-cols-2 gap-[1px] bg-[#292929] border border-[#292929]">
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">lock</span>
<span className="font-code-dense text-code-dense text-primary-container">.ssh/</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">lock</span>
<span className="font-code-dense text-code-dense text-primary-container">.env*</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">lock</span>
<span className="font-code-dense text-code-dense text-primary-container">.aws/</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">lock</span>
<span className="font-code-dense text-code-dense text-primary-container">.gnupg/</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">key</span>
<span className="font-code-dense text-code-dense text-primary-container">id_rsa*</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
<div className="bg-[#050505] p-space-sm flex items-center justify-between hover:bg-[#101010] transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-outline text-[16px]">key</span>
<span className="font-code-dense text-code-dense text-primary-container">*credentials*</span>
</div>
<span className="font-label-sm text-label-sm text-outline">[HARD_BLOCK]</span>
</div>
</div>
{/* Content Capture Policy Callout */}
<div className="bg-[#050505] border border-[#292929] p-space-md flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs">
<span className="w-1.5 h-1.5 bg-secondary-container inline-block"></span>
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary">CONTENT CAPTURE: DISABLED</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-normal">
                Sensitive paths are recorded as metadata only. File contents, secret keys, and environment variables are strictly never read, streamed, or displayed in logs, stdout, or trace dumps.
              </p>
</div>
</div>
</section>
{/* SECTION 4: LOCAL AUDIT BUFFER */}
<section className="flex flex-col flex-grow bg-[#0B0B0B]">
<div className="flex items-center justify-between px-space-lg py-space-sm bg-[#101010] border-b border-[#292929]">
<div className="flex items-center gap-space-sm">
<span className="font-label-sm text-label-sm text-outline font-bold">04 //</span>
<span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">LOCAL AUDIT BUFFER</span>
</div>
<span className="font-code-dense text-code-dense text-on-surface-variant">IPC_ENDPOINT</span>
</div>
<div className="p-space-lg flex flex-col justify-between flex-grow gap-space-lg">
<div className="flex flex-col gap-space-md">
<div className="flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">BUFFER STORAGE SOCKET</span>
<div className="flex items-center justify-between bg-[#050505] border border-[#292929] p-space-sm">
<span className="font-code-dense text-code-dense text-primary select-all">/tmp/agentguard-audit.sock</span>
<span className="font-label-sm text-label-sm uppercase text-primary-container px-space-xs py-[2px] bg-surface-container-low border border-[#292929]">UNIX SOCK</span>
</div>
</div>
{/* Buffer Metrics */}
<div className="grid grid-cols-3 gap-[1px] bg-[#292929] border border-[#292929]">
<div className="bg-[#050505] p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">FRAMES</span>
<span className="font-headline-sm text-headline-sm text-primary font-bold">4,218</span>
</div>
<div className="bg-[#050505] p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">VOLATILE SZ</span>
<span className="font-headline-sm text-headline-sm text-primary font-bold">14.6 MB</span>
</div>
<div className="bg-[#050505] p-space-sm flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase">STATUS</span>
<span className="font-headline-sm text-headline-sm text-primary-container font-bold">SYNCED</span>
</div>
</div>
</div>
{/* Buffer Purge Action */}
<div className="flex flex-col gap-space-sm pt-space-md border-t border-[#292929]">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline">VOLATILE DELETION</span>
<span className="font-code-dense text-code-dense text-secondary">IRREVERSIBLE ACTION</span>
</div>
<button className="w-full py-space-md px-space-lg bg-[#101010] border border-secondary text-secondary hover:bg-secondary hover:text-[#050505] active:bg-secondary-container active:text-on-secondary font-label-md text-label-md font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-space-sm" id="btnPurgeBuffer">
<span className="material-symbols-outlined text-[18px]">delete_forever</span>
<span>[ PURGE LOCAL AUDIT CACHE ]</span>
</button>
<div className="hidden font-code-dense text-code-dense text-primary-container text-center py-space-xs bg-[#050505] border border-[#292929]" id="purgeStatus">
                BUFFER PURGED: 0 BYTES REMAINING IN /tmp/agentguard-audit.sock
              </div>
</div>
</div>
</section>
</div>
</div>
{/* Terminal Footer Status Ribbon */}
<div className="w-full bg-[#101010] border-t border-[#292929] px-space-lg py-space-xs flex flex-wrap items-center justify-between gap-space-md font-code-dense text-code-dense text-outline">
<div className="flex items-center gap-space-md">
<span>AGENTGUARD_OS: <span className="text-on-surface">DARWIN_ARM64</span></span>
<span>DAEMON_PID: <span className="text-on-surface">41920</span></span>
<span>AUDIT_MODE: <span className="text-primary-container">ZERO_KNOWLEDGE</span></span>
</div>
<div className="flex items-center gap-space-md">
<span>LOCAL_ENCRYPT: <span className="text-primary">ENFORCED</span></span>
<span className="text-primary-container">SYS_INTEGRITY: NORMAL</span>
</div>
</div>
</div>
      </div>
    </Layout>
  );
}
