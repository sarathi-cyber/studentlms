"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      window.location.href = "/login";
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="group w-full rounded-xl border border-[#292929] px-4 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 hover:border-red-900/70 hover:bg-red-950/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-red-400" />
          Signing out...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
          </svg>

          Logout
        </span>
      )}
    </button>
  );
}
