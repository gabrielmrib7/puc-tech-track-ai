import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Carregando dados...",
  className = "py-12",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={32} className="animate-spin text-[#004ac6]" />
      <p className="text-sm font-medium text-[#515f74]">{message}</p>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-[#c3c6d7]/20">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 w-3/4 rounded bg-[#e2e7ff]" />
        </td>
      ))}
    </tr>
  );
}

