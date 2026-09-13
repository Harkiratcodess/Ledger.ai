import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { MOCK_SESSIONS } from "../mock/sessions";

const STATUS_STYLES = {
  ACTIVE: "text-primary-container border-primary-container",
  STOPPED: "text-outline border-surface-container-highest",
  COMPLETE: "text-on-surface border-outline",
};

export default function Sessions() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-low border-b border-surface-container-highest px-space-lg py-space-md flex flex-wrap items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
              AUDIT LEDGER // SESSION INDEX
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary uppercase tracking-tight mt-space-xs">
              AUDIT SESSIONS
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase mt-space-xs">
              Mock session records — replace with API later
            </p>
          </div>
          <Link
            to="/sandbox-setup"
            className="bg-primary-container text-on-primary-fixed font-label-md text-label-md uppercase px-space-md py-space-sm font-bold hover:bg-primary hover:text-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            NEW SANDBOX
          </Link>
        </div>

        <div className="w-full overflow-x-auto bg-surface-container-lowest">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-highest font-headline-sm text-headline-sm text-outline uppercase">
                <th className="px-space-md py-space-sm">SESSION</th>
                <th className="px-space-md py-space-sm">PROJECT</th>
                <th className="px-space-md py-space-sm">STATUS</th>
                <th className="px-space-md py-space-sm text-right">EVENTS</th>
                <th className="px-space-md py-space-sm">STARTED</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => navigate(`/session/${session.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/session/${session.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  className="border-b border-surface-container-highest hover:bg-surface-container cursor-pointer transition-colors focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-inset focus:ring-primary-container"
                >
                  <td className="px-space-md py-space-sm font-body-md text-body-md text-primary font-bold">
                    {session.id}
                  </td>
                  <td className="px-space-md py-space-sm font-code-dense text-code-dense text-on-surface">
                    {session.project}
                  </td>
                  <td className="px-space-md py-space-sm">
                    <span
                      className={`inline-block px-space-xs py-[2px] border font-label-sm text-label-sm uppercase font-bold ${
                        STATUS_STYLES[session.status] || STATUS_STYLES.STOPPED
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="px-space-md py-space-sm font-code-dense text-code-dense text-on-surface text-right">
                    {session.events}
                  </td>
                  <td className="px-space-md py-space-sm font-code-dense text-code-dense text-outline">
                    {session.started}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-space-md py-space-sm bg-surface-container-low border-t border-surface-container-highest font-code-dense text-code-dense text-outline uppercase">
          SHOWING {MOCK_SESSIONS.length} MOCK SESSIONS · UI PROTOTYPE
        </div>
      </div>
    </Layout>
  );
}
