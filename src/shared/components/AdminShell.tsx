"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Boxes,
  CircleHelp,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";

const navigation = [
  { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.admin.orders, label: "Ordens de Serviço", icon: Wrench },
  { href: ROUTES.admin.customers, label: "Clientes", icon: Users },
  { href: ROUTES.admin.equipment, label: "Equipamentos", icon: Boxes },
  { href: ROUTES.admin.settings, label: "Configurações", icon: Settings },
];

export function AdminShell({
  children,
  active = "",
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#131b2e]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#c3c6d7]/30 px-6">
          <Link href={ROUTES.admin.dashboard} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb] text-lg font-bold text-white">
              T
            </span>
            <span>
              <strong className="block text-xl font-bold tracking-tight text-[#004ac6]">
                TechTrack
              </strong>
              <small className="text-[11px] text-[#434655]">Technical Precision SaaS</small>
            </span>
          </Link>
          <button
            type="button"
            className="rounded p-1 text-[#434655] hover:bg-[#e2e7ff] md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {navigation.map(({ href, label, icon: Icon }) => {
            const selected = active === label;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  selected
                    ? "border-l-4 border-[#004ac6] bg-[#2563eb]/10 pl-3 text-[#004ac6]"
                    : "text-[#515f74] hover:bg-[#f2f3ff] hover:text-[#004ac6]"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#c3c6d7]/30 p-4">
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#515f74]">
            <CircleHelp size={19} />
            <span>TechTrack v0.1</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-h-screen md:ml-[280px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#c3c6d7]/50 bg-[#faf8ff] px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-[#434655] hover:bg-[#e2e7ff] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="relative w-full max-w-xs sm:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]"
              />
              <input
                className="h-9 w-full rounded-lg border border-[#c3c6d7] bg-[#f2f3ff] pl-10 pr-4 text-sm outline-none placeholder:text-[#737686] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10"
                placeholder="Buscar OS, cliente ou equipamento..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#434655]">
            <button
              type="button"
              className="rounded-full p-2 text-[#434655] hover:bg-[#e2e7ff]"
              aria-label="Notificações"
            >
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/login" />
              {user && (
                <span className="hidden text-xs font-medium text-[#434655] lg:inline-block">
                  {user.fullName || user.primaryEmailAddress?.emailAddress}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "amber" | "green" | "red";
}) {
  const styles = {
    blue: "bg-[#dbe1ff] text-[#003ea8]",
    amber: "bg-[#fff0c2] text-[#9a5a00]",
    green: "bg-[#c9f5dc] text-[#08783d]",
    red: "bg-[#ffdad6] text-[#93000a]",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}
