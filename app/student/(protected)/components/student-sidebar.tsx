"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: "⌂" },
  { label: "Courses", href: "/student/courses", icon: "▣" },
  { label: "My Enrollments", href: "/student/enrollments", icon: "✓" },
  { label: "My Attendance", href: "/student/attendance", icon: "◷" },
  { label: "Assignments", href: "/student/assignments", icon: "▤" },
  { label: "My Profile", href: "/student/profile", icon: "◉" },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur lg:hidden">
        <Link href="/student/dashboard">
          <div className="text-lg font-bold tracking-wide text-[#d4af37]">
            TECHVORA
          </div>

          <div className="text-[9px] tracking-[0.25em] text-white/50">
            ACADEMY
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-xl text-white transition hover:border-[#d4af37]/50 hover:text-[#d4af37]"
        >
          ☰
        </button>
      </header>

      {/* ================= MOBILE BACKDROP ================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-black p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/student/dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <div className="text-xl font-bold tracking-wide text-[#d4af37]">
              TECHVORA
            </div>

            <div className="text-xs tracking-[0.25em] text-white/50">
              ACADEMY
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-xl text-white/60 transition hover:border-[#d4af37]/50 hover:text-[#d4af37]"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-[#d4af37] text-black"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 rounded-xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`relative hidden min-h-screen shrink-0 flex-col border-r border-white/10 bg-black/40 transition-all duration-300 lg:flex ${
          desktopOpen ? "w-64 p-5" : "w-[72px] p-3"
        }`}
      >
        <div
          className={`mb-8 flex items-center ${
            desktopOpen ? "justify-between" : "justify-center"
          }`}
        >
          {desktopOpen && (
            <Link href="/student/dashboard">
              <div className="text-xl font-bold tracking-wide text-[#d4af37]">
                TECHVORA
              </div>

              <div className="text-xs tracking-[0.25em] text-white/50">
                ACADEMY
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setDesktopOpen((value) => !value)}
            aria-label={desktopOpen ? "Close sidebar" : "Open sidebar"}
            title={desktopOpen ? "Close sidebar" : "Open sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg text-white/60 transition hover:border-[#d4af37]/50 hover:text-[#d4af37]"
          >
            {desktopOpen ? "‹" : "☰"}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={!desktopOpen ? item.label : undefined}
              className={`flex items-center rounded-xl py-3 text-sm font-medium transition ${
                desktopOpen
                  ? "gap-3 px-4"
                  : "justify-center px-2"
              } ${
                isActive(item.href)
                  ? "bg-[#d4af37] text-black"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base">
                {item.icon}
              </span>

              {desktopOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={!desktopOpen ? "Logout" : undefined}
          className={`mt-6 flex rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50 ${
            desktopOpen
              ? "px-4 text-left"
              : "justify-center px-2"
          }`}
        >
          {desktopOpen
            ? loggingOut
              ? "Logging out..."
              : "Logout"
            : "↪"}
        </button>
      </aside>
    </>
  );
}
