"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: "♙",
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
    label: "Assignments",
    href: "/admin/assignments",
    icon: "▤",
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    icon: "◷",
  }, 
  {
    label: "Support Tickets",
    href: "/admin/support",
    icon: "?",
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

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-white lg:hidden"
        aria-label="Open admin menu"
      >
        ☰
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 bg-black transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-zinc-800 px-5">
          {!collapsed && (
            <div>
              <div className="text-lg font-bold text-[#d4af37]">
                TECHVORA
              </div>
              <div className="text-xs tracking-[0.2em] text-zinc-500">
                ADMIN LMS
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-[#d4af37] hover:text-[#d4af37] lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="border-b border-zinc-800 px-5 py-4">
          {!collapsed && (
            <>
              <p className="truncate text-sm text-white">{user.email}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#d4af37]">
                {user.role}
              </p>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {user.role === "super_admin" && (
            <Link
              href="/admin/users"
              onClick={() => setMobileOpen(false)}
              className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname === "/admin/users" || pathname.startsWith("/admin/users/")
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base">♙</span>
              {!collapsed && <span>Admin Management</span>}
            </Link>
          )}

          {navigation.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span>↪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={`hidden lg:block ${
          collapsed ? "w-20" : "w-72"
        } shrink-0`}
      />
    </>
  );
}
