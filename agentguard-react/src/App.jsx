import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import Overview from "./pages/Overview";
import Filesystem from "./pages/Filesystem";
import Network from "./pages/Network";
import SandboxSetup from "./pages/SandboxSetup";
import Sessions from "./pages/Sessions";
import SessionDetails from "./pages/SessionDetails";
import EmptyState from "./pages/EmptyState";
import EventDetails from "./pages/EventDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/filesystem" element={<Filesystem />} />
        <Route path="/network" element={<Network />} />
        <Route path="/sandbox-setup" element={<SandboxSetup />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/session/:id" element={<SessionDetails />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/event-details" element={<Navigate to="/event/EVT-000122" replace />} />
        <Route path="/empty-state" element={<EmptyState />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
