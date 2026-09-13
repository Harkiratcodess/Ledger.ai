import React from "react";

export default function ErrorState({
  title = "SYSTEM ERROR",
  message = "Unable to load requested resource.",
  onRetry,
}) {
  return (
    <div
      className="border border-error-container bg-surface-container-low p-space-lg flex flex-col gap-space-md max-w-lg"
      role="alert"
    >
      <div className="flex items-center gap-space-sm">
        <span className="w-2 h-2 bg-error inline-block" aria-hidden="true" />
        <h2 className="font-headline-sm text-headline-sm uppercase text-error tracking-wider">{title}</h2>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start bg-surface border border-surface-container-highest text-on-surface font-label-md text-label-md uppercase px-space-md py-space-sm hover:border-primary-container hover:text-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
        >
          [ RETRY ]
        </button>
      )}
    </div>
  );
}
