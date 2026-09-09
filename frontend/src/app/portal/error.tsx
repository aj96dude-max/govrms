"use client";

import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal Error Boundaries Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <AlertOctagon className="w-16 h-16 text-red-500 mb-6 opacity-80" />
      <h1 className="text-3xl font-bold tracking-widest text-white uppercase mb-2">
        System Offline
      </h1>
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        The Government Requisition Management System is currently unable to communicate with the core database ledger. Please ensure your secure tunnel is active or contact the Engineering Division.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="primary">
          Reload Gateway
        </Button>
        <Button onClick={() => reset()} variant="secondary">
          Try Again
        </Button>
      </div>
    </div>
  );
}
