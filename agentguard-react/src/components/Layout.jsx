import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const PRIMARY_NAV = [
  { label: "OVERVIEW", to: "/" },
  { label: "FILESYSTEM", to: "/filesystem" },
  { label: "NETWORK", to: "/network" },
  { label: "SANDBOX SETUP", to: "/sandbox-setup" },
  { label: "SESSIONS", to: "/sessions" },
];

const SECONDARY_NAV = [{ label: "SETTINGS", to: "/settings" }];

const ACTIVE_CLASSES =
  "px-space-md py-space-sm flex items-center transition-colors border-l-2 border-primary-container bg-surface-container-highest text-primary-container font-bold focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary-container";
const INACTIVE_CLASSES =
  "px-space-md py-space-sm font-label-md text-label-md text-on-surface-variant border-b border-surface-container-highest flex items-center transition-colors hover:bg-surface-container hover:text-on-surface focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary-container";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-low border-b border-surface-container-highest z-50 flex items-center justify-between px-space-md lg:px-space-lg gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <button
            type="button"
            className="lg:hidden border border-surface-container-highest px-space-sm py-space-xs font-label-sm text-label-sm text-on-surface uppercase hover:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={sidebarOpen}
          >
            MENU
          </button>
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider">
              AGENTGUARD
            </span>
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-widest hidden sm:block truncate">
              REAL-TIME BEHAVIOR AUDITOR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm lg:gap-space-lg shrink-0">
          <div className="hidden md:block border border-surface-container-highest px-space-sm py-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase">
            LOCAL ONLY
          </div>
          <div className="flex items-center gap-space-sm border border-surface-container-highest px-space-sm py-space-xs">
            <span className="w-2 h-2 bg-primary-container animate-pulse-fast inline-block" aria-hidden="true" />
            <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider font-bold">
              MONITORING ACTIVE
            </span>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 bg-black/60 z-30 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low border-r border-surface-container-highest z-40 flex flex-col justify-between transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col overflow-y-auto">
          <nav className="flex flex-col" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeSidebar}
                className={({ isActive }) => (isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-col mt-space-md">
            <div className="px-space-md py-space-xs font-label-sm text-label-sm text-outline uppercase bg-surface-container-lowest border-y border-surface-container-highest">
              SYSTEM
            </div>
            <nav className="flex flex-col" aria-label="System">
              {SECONDARY_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-surface-container-highest p-space-md bg-surface-container-lowest">
          <div className="font-code-dense text-code-dense text-on-surface-variant flex flex-col gap-space-xs">
            <div>
              INSTANCE: <span className="text-primary">LOCAL</span>
            </div>
            <div>
              MODE: <span className="text-primary-container">UI PROTOTYPE</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="w-full pt-16 bg-surface-container-lowest min-h-screen">{children}</main>
      </div>
    </>
  );
}
