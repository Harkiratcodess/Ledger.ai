import React from 'react';
import Layout from '../components/Layout';

export default function EventDetails() {
  return (
    <Layout active="event-details">
      <div className="flex flex-col w-full">
<section className="w-full bg-surface-container-low border-b border-surface-container-highest p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-space-sm">
<a className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase text-outline transition-colors hover:text-primary" data-path="overview" href="#">
<span className="material-symbols-outlined text-[14px]">arrow_back</span>
<span>ACTIVITY STREAM</span>
</a>
<span className="text-outline font-label-sm text-label-sm">/</span>
<span className="font-label-sm text-label-sm uppercase text-primary-container font-bold">KERNEL INTERCEPT</span>
</div>
<div className="flex items-baseline gap-space-md">
<h1 className="font-headline-lg text-headline-lg uppercase text-primary tracking-tight">EVENT DETAILS</h1>
<span className="font-code-dense text-code-dense text-on-surface-variant tracking-wider bg-surface-container-highest px-space-sm py-0.5">RECORD ID: EVT-000128</span>
</div>
</div>
<div className="flex items-center gap-space-sm flex-wrap">
<button className="bg-surface border border-surface-container-highest text-on-surface font-label-md text-label-md uppercase px-space-md py-space-sm flex items-center gap-space-xs transition-colors hover:bg-surface-bright active:bg-surface-dim" id="copy-btn">
<span className="material-symbols-outlined text-[16px] text-primary-container">content_copy</span>
<span id="copy-btn-label">COPY EVENT METADATA</span>
</button>
<button className="bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-md py-space-sm flex items-center gap-space-xs tracking-wider transition-colors hover:bg-secondary hover:text-on-secondary-fixed">
<span className="material-symbols-outlined text-[16px]">shield_with_heart</span>
<span>REVOKE RUNTIME CAPABILITIES</span>
</button>
</div>
</section>
<div className="grid grid-cols-1 xl:grid-cols-12 w-full">
<div className="xl:col-span-8 flex flex-col border-b xl:border-b-0 xl:border-r border-surface-container-highest bg-surface-container-lowest">
<div className="bg-error-container/20 border-b border-error-container p-space-md flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="inline-block w-2.5 h-2.5 bg-error animate-pulse-fast"></span>
<span className="font-label-md text-label-md uppercase tracking-wider text-error font-bold">[!] CRITICAL INTERCEPTION RULE TRIGGERED</span>
</div>
<div className="font-code-dense text-code-dense text-on-error-container bg-error-container/40 px-space-sm py-0.5">
          POLICY: SHIELD_CRYPTO_VAULT_V1
        </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 bg-surface-container-low border-b border-surface-container-highest">
<div className="p-space-lg border-b md:border-b-0 md:border-r border-surface-container-highest flex flex-col justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm uppercase text-outline">PRIMARY EVENT IDENTIFIER</span>
<span className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">EVT-000128</span>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-surface-container-highest">
<span className="font-code-dense text-code-dense text-on-surface-variant uppercase">INTERCEPT TIMESTAMP</span>
<span className="font-body-md text-body-md text-primary font-bold">10:43:11.241 UTC</span>
</div>
</div>
<div className="p-space-lg flex flex-col justify-between gap-space-md bg-surface-container-lowest">
<div className="flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm uppercase text-outline">DISPOSITION CLASSIFICATION</span>
<div className="flex items-center gap-space-xs">
<span className="border border-error text-error bg-error-container/30 font-label-sm text-label-sm uppercase px-space-sm py-0.5 font-bold">
                BLOCKED / METADATA RECORDED ONLY
              </span>
</div>
</div>
<div className="flex items-center justify-between pt-space-md border-t border-surface-container-highest">
<span className="font-code-dense text-code-dense text-on-surface-variant uppercase">INTERVENTION LATENCY</span>
<span className="font-code-dense text-code-dense text-primary-container font-bold">&lt; 0.42 ms (PRE-EXECUTION)</span>
</div>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-lg">
<div className="flex items-center justify-between border-b border-surface-container-highest pb-space-xs">
<span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">KERNEL TELEMETRY BREAKDOWN</span>
<span className="font-code-dense text-code-dense text-outline">SUBSYSTEM: FS_MON_V2</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="bg-surface-container border border-surface-container-highest p-space-md flex flex-col gap-space-sm">
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant">OPERATION CLASS</span>
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-error">lock</span>
<span className="font-body-lg text-body-lg text-primary font-bold">ACCESS [SHIELDED INTERCEPT]</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Target flagged as Tier-0 cryptographic credential. Direct byte reads dropped at virtual file system (VFS) layer.
            </p>
</div>
<div className="bg-surface-container border border-surface-container-highest p-space-md flex flex-col gap-space-sm">
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant">TARGET SYSTEM PATH</span>
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">folder_special</span>
<span className="font-body-lg text-body-lg text-secondary font-bold truncate">.ssh/id_rsa</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              INODE: <span className="text-primary font-code-dense">14092842</span> • MOUNT: <span className="text-primary font-code-dense">/host/sandbox/env</span>
</p>
</div>
<div className="bg-surface-container border border-surface-container-highest p-space-md flex flex-col gap-space-sm">
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant">INGESTION SOURCE</span>
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-primary-container">memory</span>
<span className="font-body-lg text-body-lg text-primary font-bold">FILESYSTEM WATCHER</span>
</div>
<p className="font-code-dense text-code-dense text-on-surface-variant">
              HOOK: KERNEL_INODE_HOOK_SECCOMP_BPF
            </p>
</div>
<div className="bg-surface-container border border-surface-container-highest p-space-md flex flex-col gap-space-sm">
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant">RUNTIME ISOLATION BOUNDARY</span>
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-primary-container">terminal</span>
<span className="font-body-lg text-body-lg text-primary font-bold">SESSION: AG-2026-001</span>
</div>
<p className="font-code-dense text-code-dense text-on-surface-variant">
              CGROUP: /agent_jail/ag_worker_p602
            </p>
</div>
</div>
<div className="bg-surface-container-low border border-surface-container-highest flex flex-col">
<div className="bg-surface-container-highest px-space-md py-space-xs flex items-center justify-between border-b border-surface-container-high">
<span className="font-label-sm text-label-sm uppercase text-on-surface tracking-wider">PROCESS INSPECTOR</span>
<span className="font-code-dense text-code-dense text-error font-bold">SIGNAL SIGSTOP DISPATCHED</span>
</div>
<div className="p-space-md flex flex-col gap-space-sm font-code-dense text-code-dense">
<div className="grid grid-cols-12 gap-space-xs">
<span className="col-span-3 text-outline uppercase">TRIGGERING PID:</span>
<span className="col-span-9 text-primary font-bold">602</span>
</div>
<div className="grid grid-cols-12 gap-space-xs">
<span className="col-span-3 text-outline uppercase">PPID (PARENT):</span>
<span className="col-span-9 text-on-surface">588 [agent_runtime_executor]</span>
</div>
<div className="grid grid-cols-12 gap-space-xs">
<span className="col-span-3 text-outline uppercase">RAW INSTRUCTION:</span>
<span className="col-span-9 text-error bg-surface-container-lowest p-space-xs border border-surface-container-highest font-bold">cat .ssh/id_rsa</span>
</div>
<div className="grid grid-cols-12 gap-space-xs">
<span className="col-span-3 text-outline uppercase">EXEC CONTEXT:</span>
<span className="col-span-9 text-on-surface-variant">UID: 1001 (agent-worker) • GID: 1001 • TTY: pts/3 • BIN: /usr/bin/cat</span>
</div>
</div>
</div>
<div className="border-2 border-primary-container bg-surface-container-low p-space-lg flex flex-col gap-space-md relative overflow-hidden">
<div className="flex items-start justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[24px]">verified_user</span>
<div>
<h3 className="font-headline-sm text-headline-sm uppercase text-primary tracking-wide">SECURITY &amp; PRIVACY ENFORCEMENT</h3>
<span className="font-label-sm text-label-sm uppercase text-primary-container font-bold">CONTENT CAPTURE: DISABLED</span>
</div>
</div>
<span className="border border-primary-container bg-surface-container-highest text-primary-container font-code-dense text-code-dense px-space-sm py-space-xs font-bold uppercase">
              ZERO-RETENTION ACTIVE
            </span>
</div>
<div className="space-y-space-sm border-t border-surface-container-highest pt-space-md">
<p className="font-body-md text-body-md text-on-surface">
<span className="text-primary font-bold">AgentGuard does NOT inspect, read, or store file contents, source code, or cryptographic keys.</span>
              For sensitive paths (<code className="text-primary-container bg-surface-container-highest px-1">.ssh/</code>, <code className="text-primary-container bg-surface-container-highest px-1">.env</code>, <code className="text-primary-container bg-surface-container-highest px-1">.aws/</code>), only filesystem metadata (path, operation, timestamp, calling process) is recorded to the local audit ledger.
            </p>
<div className="bg-surface-container-lowest border border-surface-container-highest p-space-sm flex items-center gap-space-sm text-on-surface-variant font-code-dense text-code-dense">
<span className="material-symbols-outlined text-[16px] text-outline">block</span>
<span>No source code diff is generated or previewed. Memory payload buffer was flushed immediately at intercept.</span>
</div>
</div>
</div>
</div>
</div>
<div className="xl:col-span-4 flex flex-col bg-surface-container-low">
<div className="p-space-md bg-surface-container-high border-b border-surface-container-highest flex items-center justify-between">
<span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">CHRONOLOGICAL AUDIT CHAIN</span>
<span className="font-code-dense text-code-dense text-primary-container">BLOCK #14209</span>
</div>
<div className="flex flex-col border-b border-surface-container-highest">
<div className="p-space-md border-b border-surface-container-highest bg-surface-container-lowest flex flex-col gap-space-xs transition-colors hover:bg-surface-container">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline">PREVIOUS RECORD</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">10:42:39.102</span>
</div>
<div className="flex items-center justify-between">
<a className="font-body-md text-body-md font-bold text-primary hover:text-primary-container" href="#">EVT-000127</a>
<span className="font-label-sm text-label-sm text-primary-container bg-surface-container-highest px-space-xs py-0.5 uppercase">CREATE</span>
</div>
<div className="font-code-dense text-code-dense text-on-surface-variant truncate">
            src/components/Header.jsx
          </div>
<div className="flex items-center gap-space-xs text-outline font-code-dense text-code-dense pt-space-xs">
<span className="material-symbols-outlined text-[12px]">check_circle</span>
<span>AUDITED • ALLOWED • PID: 588</span>
</div>
</div>
<div className="p-space-md border-l-2 border-l-error bg-error-container/10 border-b border-surface-container-highest flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-error font-bold">CURRENT SELECTION</span>
<span className="font-code-dense text-code-dense text-error font-bold">10:43:11.241</span>
</div>
<div className="flex items-center justify-between">
<span className="font-body-md text-body-md font-bold text-primary">EVT-000128</span>
<span className="font-label-sm text-label-sm text-error bg-error-container/40 px-space-xs py-0.5 uppercase font-bold">ACCESS [INTERCEPT]</span>
</div>
<div className="font-code-dense text-code-dense text-error font-bold truncate">
            .ssh/id_rsa
          </div>
<div className="flex items-center gap-space-xs text-error font-code-dense text-code-dense pt-space-xs">
<span className="material-symbols-outlined text-[12px]">shield</span>
<span>CONTAINMENT ENGAGED • PID: 602</span>
</div>
</div>
<div className="p-space-md border-b border-surface-container-highest bg-surface-container-lowest flex flex-col gap-space-xs transition-colors hover:bg-surface-container">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-outline">SUCCEEDING RECORD</span>
<span className="font-code-dense text-code-dense text-on-surface-variant">10:43:12.008</span>
</div>
<div className="flex items-center justify-between">
<a className="font-body-md text-body-md font-bold text-primary hover:text-primary-container" href="#">EVT-000129</a>
<span className="font-label-sm text-label-sm text-secondary bg-surface-container-highest px-space-xs py-0.5 uppercase">ACCESS</span>
</div>
<div className="font-code-dense text-code-dense text-on-surface-variant truncate">
            .env
          </div>
<div className="flex items-center gap-space-xs text-error font-code-dense text-code-dense pt-space-xs">
<span className="material-symbols-outlined text-[12px]">shield</span>
<span>INTERCEPTED • PID: 602</span>
</div>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-md border-b border-surface-container-highest bg-surface-container-lowest">
<span className="font-label-sm text-label-sm uppercase text-outline">CRYPTOGRAPHIC ATTESTATION</span>
<div className="flex flex-col gap-space-xs bg-surface-container p-space-md border border-surface-container-highest">
<div className="flex items-center justify-between">
<span className="font-code-dense text-code-dense text-on-surface-variant">LEDGER CHECKSUM</span>
<span className="material-symbols-outlined text-[14px] text-primary-container">verified</span>
</div>
<span className="font-code-dense text-code-dense text-primary break-all">
            SHA256: 89f0a7114c09d3b9e4a3177f19129df4023c5e23ba99f6ec6d17b43c683b51ef
          </span>
</div>
<div className="grid grid-cols-2 gap-space-xs font-code-dense text-code-dense text-on-surface-variant">
<div>PARENT HASH: <span className="text-primary font-bold">4b1a82f...</span></div>
<div className="text-right">SIGNER: <span className="text-primary-container font-bold">ED25519:LOCAL</span></div>
<div>BLOCK DEPTH: <span className="text-primary">12</span></div>
<div className="text-right">MUTABILITY: <span className="text-error font-bold">WORM_LOCKED</span></div>
</div>
</div>
<div className="p-space-lg flex flex-col gap-space-md bg-surface-container-low flex-1">
<span className="font-label-sm text-label-sm uppercase text-outline">SANDBOX CONTEXT TELEMETRY</span>
<div className="space-y-space-xs font-code-dense text-code-dense">
<div className="flex justify-between py-space-xs border-b border-surface-container-highest">
<span className="text-outline">AGENT IDENTITY</span>
<span className="text-primary">AUTONOMOUS_CODER_v4</span>
</div>
<div className="flex justify-between py-space-xs border-b border-surface-container-highest">
<span className="text-outline">POLICY REVISION</span>
<span className="text-primary">REV-8829 (ENFORCING)</span>
</div>
<div className="flex justify-between py-space-xs border-b border-surface-container-highest">
<span className="text-outline">CONTAINER ID</span>
<span className="text-primary">ag_jail_001_s602</span>
</div>
<div className="flex justify-between py-space-xs border-b border-surface-container-highest">
<span className="text-outline">NETWORK EGRESS</span>
<span className="text-error font-bold">DISABLED (SEALED)</span>
</div>
<div className="flex justify-between py-space-xs">
<span className="text-outline">AUDIT BUFFER</span>
<span className="text-primary-container">SYNCHRONIZED (LOCAL)</span>
</div>
</div>
<div className="mt-auto pt-space-lg">
<a className="w-full bg-surface-container-highest text-on-surface border border-surface-container-high py-space-sm px-space-md font-label-md text-label-md uppercase text-center block transition-colors hover:bg-surface-bright hover:text-primary" data-path="overview" href="#">
            ← RETURN TO LIVE TIMELINE
          </a>
</div>
</div>
</div>
</div>
      </div>
    </Layout>
  );
}
