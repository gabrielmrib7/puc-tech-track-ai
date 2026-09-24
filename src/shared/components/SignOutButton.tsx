"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

/**
 * Botão de sign-out reutilizável para o portal do cliente.
 * Usa a API do Clerk para encerrar a sessão e redirecionar ao login.
 */
export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/login" })}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors"
      aria-label="Encerrar sessão"
    >
      <LogOut size={14} />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
