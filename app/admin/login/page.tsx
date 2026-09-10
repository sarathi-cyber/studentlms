"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18 18 0 0 1-3.2 3.8" />
      <path d="M6.2 6.3C3.9 8.1 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Invalid admin email or password."
            : data.error || "Unable to sign in.",
        );
        return;
      }

      if (data.user?.role !== "admin") {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        setError("This account does not have administrator access.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="techvora-page min-h-screen px-6 py-12">
      <div className="techvora-content flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="techvora-card w-full max-w-md rounded-3xl p-8 sm:p-10">
          <div className="text-center">
            <div className="mb-4 text-sm font-bold tracking-[0.4em] text-[#d4af37]">
              TECHVORA
            </div>

            <h1 className="text-3xl font-bold text-white">
              Administrator Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Secure access to the Techvora administration panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Admin Email
              </label>

              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="techvora-input w-full rounded-xl"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="techvora-input w-full rounded-xl pr-12"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition-all duration-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                >
                  <span
                    className={`block transition-all duration-300 ${
                      showPassword
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-90 opacity-80"
                    }`}
                  >
                    <EyeIcon visible={showPassword} />
                  </span>
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-zinc-500 transition hover:text-[#d4af37]"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="techvora-button w-full rounded-xl"
            >
              {loading ? "Signing in..." : "Admin Sign In"}
            </button>
          </form>

          <div className="my-7 techvora-divider" />

          <div className="text-center">
            <Link
              href="/student/login"
              className="text-sm text-zinc-500 transition hover:text-[#d4af37]"
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
