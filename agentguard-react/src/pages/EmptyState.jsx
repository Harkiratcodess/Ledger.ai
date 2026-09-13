import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function EmptyState() {
  const [events, setEvents] = useState([]);

  function simulateTouch() {
    const stamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setEvents((prev) => [
      {
        id: prev.length + 1,
        line: `[${stamp}] MOCK TOUCH → /workspace/demo-project/tmp/sim-${prev.length + 1}.txt`,
      },
      ...prev,
    ]);
  }

  return (
    <Layout>
      <div className="flex flex-col w-full bg-surface-container-lowest">
        <div className="flex flex-wrap items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-surface-container-highest gap-space-md">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">FILESYSTEM WATCHER</span>
            <span className="font-label-sm text-label-sm uppercase text-outline tracking-widest">EMPTY / WAITING STATE</span>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-sm py-space-xs border border-surface-container-highest">
            <span className="w-2 h-2 bg-primary-container inline-block animate-pulse-fast" />
            <span className="font-label-md text-label-md uppercase text-primary-container tracking-wider font-bold">IDLE [MOCK]</span>
          </div>
        </div>

        <div className="p-space-lg flex flex-col gap-space-lg">
          <div className="w-full bg-[#0B0B0B] border border-[#292929] flex flex-col">
            <div className="bg-[#101010] border-b border-[#292929] px-space-md py-space-sm flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                DAEMON STATUS // WAITING FOR ACTIVITY
              </span>
              <span className="font-code-dense text-code-dense text-outline">UI PROTOTYPE</span>
            </div>
            <div className="p-space-xl flex flex-col items-center justify-center text-center py-16">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight uppercase">WAITING FOR ACTIVITY</span>
                <span className="w-2.5 h-4 bg-primary-container inline-block animate-pulse-fast" />
              </div>
              <div className="font-body-md text-body-md text-outline max-w-xl flex flex-col gap-1 mb-space-xl">
                <p>No filesystem events in the buffer.</p>
                <p>Simulate a mock touch event, or open the filesystem stream.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-space-md">
                <button
                  type="button"
                  onClick={simulateTouch}
                  className="bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider px-space-md py-space-sm hover:bg-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  [ SIMULATE TEST TOUCH EVENT ]
                </button>
                <button
                  type="button"
                  onClick={() => setEvents([])}
                  className="border border-[#292929] text-outline font-label-md text-label-md uppercase px-space-md py-space-sm hover:text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
                >
                  RESET BUFFER
                </button>
                <Link
                  to="/filesystem"
                  className="font-label-md text-label-md uppercase text-primary-container hover:text-primary focus:outline-none focus:underline"
                >
                  OPEN FILESYSTEM →
                </Link>
              </div>
            </div>
            {events.length > 0 && (
              <div className="border-t border-[#292929] bg-[#050505] p-space-md flex flex-col font-code-dense text-code-dense">
                <div className="text-outline uppercase tracking-wider pb-space-xs border-b border-[#292929] flex justify-between mb-space-xs">
                  <span>EVENT DUMP (MOCK CACHE)</span>
                  <span className="text-primary-container">{events.length} EVENTS</span>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {events.map((e) => (
                    <div key={e.id} className="text-on-surface-variant">
                      {e.line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
