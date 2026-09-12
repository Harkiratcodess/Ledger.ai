import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Overview from "./pages/Overview";
import Filesystem from "./pages/Filesystem";
import SandboxSetup from "./pages/SandboxSetup";
import SessionDetails from "./pages/SessionDetails";
import EmptyState from "./pages/EmptyState";
import EventDetails from "./pages/EventDetails";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/filesystem" element={<Filesystem />} />
        <Route path="/sandbox-setup" element={<SandboxSetup />} />
        <Route path="/sessions" element={<SessionDetails />} />
        <Route path="/empty-state" element={<EmptyState />} />
        <Route path="/event-details" element={<EventDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
