import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Ocorreu um erro",
  message = "Não foi possível carregar os dados. Verifique sua conexão e tente novamente.",
  onRetry,
  className = "py-10",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6]/20 p-6 text-center ${className}`}
      role="alert"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ffdad6] text-[#ba1a1a]">
        <AlertCircle size={24} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-[#131b2e]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#434655]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-4 py-2 text-sm font-semibold text-[#131b2e] shadow-sm hover:bg-[#f2f3ff]"
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}

