"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Logout failed:", await response.text());
        setLoggingOut(false);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#d4af37]/50 hover:text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
