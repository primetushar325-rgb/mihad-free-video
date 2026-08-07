"use client";

// Global error boundary — graceful error UI with retry.
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 text-red-400">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-white">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button onClick={reset} className="btn-gold mt-6">
        <RotateCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
