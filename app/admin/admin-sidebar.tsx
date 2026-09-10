"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "⌂",
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: "▣",
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: "♙",
  },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: "＋",
  },
  {
    label: "Progress",
    href: "/admin/progress",
    icon: "◒",
  },
  {
    label: "Assessments",
    href: "/admin/assessments",
    icon: "✓",
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: "◇",
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: "▤",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "⚙",
  },
];

type AdminSidebarProps = {
  user: {
    email: string;
    role: string;
    status: string;
  };
};

export default function AdminSidebar({
  user,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open admin navigation"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#0d0d0d] text-xl text-[#d4af37] shadow-lg lg:hidden"
      >
        ☰
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-[#242424] bg-[#090909]",
          "transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[#242424] px-6 py-6">
            <div className="techvora-gold-text text-2xl font-black tracking-[0.16em]">
              TECHVORA
            </div>

            <div className="mt-1 text-[10px] font-medium tracking-[0.42em] text-zinc-500">
              ACADEMY
            </div>

            <div className="mt-5 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                Administration
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                LMS Control Center
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
              Management
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                      active
                        ? "bg-[#d4af37] font-semibold text-black shadow-lg shadow-[#d4af37]/10"
                        : "text-zinc-400 hover:bg-[#151515] hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-lg text-base",
                        active
                          ? "bg-black/10 text-black"
                          : "bg-[#151515] text-[#d4af37]",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#242424] p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#242424] bg-[#101010] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 font-bold text-[#d4af37]">
                {user.email.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user.email}
                </p>

                <p className="mt-1 text-[11px] capitalize text-zinc-600">
                  {user.role} · {user.status}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-[#292929] px-4 py-3 text-left text-sm text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
