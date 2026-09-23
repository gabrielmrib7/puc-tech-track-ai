import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nenhum registro encontrado",
  description = "Ainda não existem dados cadastrados para esta exibição.",
  action,
  className = "py-12",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#c3c6d7] p-8 text-center ${className}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f2f3ff] text-[#515f74]">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#131b2e]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#434655]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

