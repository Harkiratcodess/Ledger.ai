import React from "react";

export default function LoadingState({ label = "LOADING..." }) {
  return (
    <div
      className="flex items-center gap-space-sm font-label-md text-label-md uppercase text-primary-container tracking-wider"
      role="status"
      aria-live="polite"
    >
      <span className="w-2.5 h-4 bg-primary-container inline-block animate-pulse-fast" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
