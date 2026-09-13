import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col items-center justify-center px-space-lg">
      <div className="w-full max-w-md border border-surface-container-highest bg-surface-container-low p-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <span className="font-headline-xl text-headline-xl text-primary-container tracking-tight">404</span>
          <h1 className="font-headline-lg text-headline-lg uppercase text-primary tracking-wider">
            RESOURCE NOT FOUND
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The requested route does not exist.
          </p>
        </div>
        <Link
          to="/"
          className="w-full text-center py-space-md bg-primary-container text-on-primary-fixed font-label-md text-label-md uppercase font-bold tracking-wider hover:bg-primary hover:text-surface focus:outline-none focus:ring-1 focus:ring-primary"
        >
          [ RETURN TO OVERVIEW ]
        </Link>
      </div>
    </div>
  );
}
