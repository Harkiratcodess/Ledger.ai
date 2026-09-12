import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "overview", label: "OVERVIEW", to: "/" },
  { path: "filesystem", label: "FILESYSTEM", to: "/filesystem" },
  { path: "sandbox-setup", label: "SANDBOX SETUP", to: "/sandbox-setup" },
  { path: "sessions", label: "SESSIONS", to: "/sessions" },
  { path: "empty-state", label: "EMPTY STATE", to: "/empty-state" },
  { path: "event-details", label: "EVENT DETAILS", to: "/event-details" },
  { path: "settings", label: "SETTINGS", to: "/settings" },
];

const ACTIVE_CLASSES =
  "px-space-md py-space-sm flex items-center transition-colors border-l-2 border-primary-container bg-surface-container-highest text-primary-container font-bold";
const INACTIVE_CLASSES =
  "px-space-md py-space-sm font-label-md text-label-md text-on-surface-variant border-b border-surface-container-highest flex items-center transition-colors hover:bg-surface-container hover:text-on-surface";

export default function Layout({ children }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-low border-b border-surface-container-highest z-50 flex items-center justify-between px-space-lg">
        <div className="flex flex-col justify-center">
          <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">
            AGENTGUARD
          </span>
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-widest">
            REAL-TIME BEHAVIOR AUDITOR
          </span>
        </div>
        <div className="flex items-center gap-space-lg">
          <div className="border border-surface-container-highest px-space-sm py-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase">
            LOCAL ONLY
          </div>
          <div className="flex items-center gap-space-sm border border-surface-container-highest px-space-sm py-space-xs">
            <span className="w-2 h-2 bg-primary-container animate-pulse-fast inline-block"></span>
            <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">
              MONITORING
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low border-r border-surface-container-highest z-40 flex flex-col justify-between">
        <div className="flex flex-col">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col">
            <div className="px-space-md py-space-xs font-label-sm text-label-sm text-outline uppercase bg-surface-container-lowest border-b border-surface-container-highest">
              STAGED SUBSYSTEMS
            </div>
            <div className="px-space-md py-space-sm font-label-md text-label-md text-outline border-b border-surface-container-highest cursor-not-allowed opacity-50 flex items-center justify-between">
              <span>NETWORK</span>
              <span className="font-code-dense text-code-dense">[DISABLED / V0.2]</span>
            </div>
            <div className="px-space-md py-space-sm font-label-md text-label-md text-outline border-b border-surface-container-highest cursor-not-allowed opacity-50 flex items-center justify-between">
              <span>RISK ENGINE</span>
              <span className="font-code-dense text-code-dense">[DISABLED / V0.2]</span>
            </div>
          </div>
        </div>
        <div className="border-t border-surface-container-highest p-space-md bg-surface-container-lowest">
          <div className="font-code-dense text-code-dense text-on-surface-variant flex flex-col gap-space-xs">
            <div>
              DAEMON: <span className="text-primary">LOCALHOST:9091</span>
            </div>
            <div>
              ENV: <span className="text-primary-container">ISOLATED</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <main className="w-full pt-16 bg-surface-container-lowest min-h-screen">{children}</main>
      </div>
    </>
  );
}
