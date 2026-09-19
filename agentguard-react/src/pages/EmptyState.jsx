import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function EmptyState() {
  return (
    <Layout>
      <div className="flex flex-col w-full bg-surface-container-lowest">
        <div className="flex flex-wrap items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-surface-container-highest gap-space-md">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">FILESYSTEM WATCHER</span>
            <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">EMPTY / WAITING STATE</span>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-sm py-space-xs border border-surface-container-highest">
            <span className="w-2 h-2 bg-outline inline-block" />
            <span className="font-label-md text-label-md uppercase text-outline tracking-wider font-bold">NO EVENTS</span>
          </div>
        </div>

        <div className="p-space-lg flex flex-col gap-space-lg">
          <div className="w-full bg-[#0B0B0B] border border-[#292929] flex flex-col">
            <div className="bg-[#101010] border-b border-[#292929] px-space-md py-space-sm flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                DAEMON STATUS // WAITING FOR ACTIVITY
              </span>
              <span className="font-code-dense text-code-dense text-outline">LOCAL RUNTIME</span>
            </div>
            <div className="p-space-xl flex flex-col items-center justify-center text-center py-16">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight uppercase">WAITING FOR ACTIVITY</span>
                <span className="w-2.5 h-4 bg-primary-container inline-block animate-pulse-fast" />
              </div>
              <div className="font-body-md text-body-md text-outline max-w-xl flex flex-col gap-1 mb-space-xl">
                <p>No filesystem events have been recorded for the current session.</p>
                <p>Protect a workspace with `ledger protect .` then run agent workloads inside the sandbox.</p>
              </div>
              <Link
                to="/filesystem"
                className="font-label-md text-label-md uppercase text-primary-container hover:text-primary focus:outline-none focus:underline"
              >
                OPEN FILESYSTEM →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
