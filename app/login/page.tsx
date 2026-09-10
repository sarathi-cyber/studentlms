"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to sign in. Please check your details.",
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="techvora-page flex items-center justify-center px-6 py-10 text-white">
      <div className="techvora-content w-full max-w-md">
        <Brand />

        <div className="techvora-card techvora-glow rounded-3xl p-7 shadow-2xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Student Portal
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Sign in to continue your learning journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="techvora-input w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#d4af37] transition hover:text-[#f1d77a]"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  className="techvora-input w-full rounded-xl px-4 py-3.5 pr-16 text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="group absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-all duration-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                >
                  <span
                    className={`transition-all duration-300 ${
                      showPassword
                        ? "rotate-0 scale-110"
                        : "rotate-[-8deg] scale-100"
                    }`}
                  >
                    {showPassword ? (
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="2.8" />
                      </svg>
                    ) : (
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m3 3 18 18" />
                        <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.1 3.9" />
                        <path d="M6.6 6.6C3.7 8.3 2 12 2 12s3.5 7 10 7a10.6 10.6 0 0 0 3.4-.6" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="animate-[page-enter_0.25s_ease-out] rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm leading-5 text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="techvora-button w-full rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="techvora-divider my-7" />

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#d4af37] transition hover:text-[#f1d77a]"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-zinc-600">
          Secure student access · Techvora Academy
        </p>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="mb-8 text-center">
      <div className="techvora-gold-text text-3xl font-black tracking-[0.12em]">
        TECHVORA
      </div>

      <div className="mt-1 text-[10px] font-medium tracking-[0.5em] text-zinc-500">
        ACADEMY
      </div>

      <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
    </div>
  );
}
