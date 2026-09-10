"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to process your request. Please try again.",
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="techvora-page flex min-h-screen items-center justify-center px-6 py-10 text-white">
      <div className="techvora-content w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/student/login" className="inline-block">
            <div className="techvora-gold-text text-3xl font-black tracking-[0.12em]">
              TECHVORA
            </div>

            <div className="mt-1 text-[10px] font-medium tracking-[0.5em] text-zinc-500">
              ACADEMY
            </div>

            <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          </Link>
        </div>

        <div className="techvora-card techvora-glow rounded-3xl p-7 shadow-2xl sm:p-8">
          {!submitted ? (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                  Account Recovery
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                  Forgot your password?
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Enter your registered email address and we&apos;ll
                  help you reset your password.
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
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-[page-enter_0.4s_ease-out] text-center">
              <div className="techvora-float mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-2xl text-[#d4af37]">
                ✓
              </div>

              <h1 className="mt-7 text-2xl font-bold">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                If an account exists for that email address, password
                reset instructions have been sent.
              </p>

              <div className="techvora-divider my-6" />

              <p className="text-xs leading-5 text-zinc-600">
                For your security, we don&apos;t reveal whether an
                email address is registered.
              </p>
            </div>
          )}

          <div className="techvora-divider mt-7 pt-6 text-center">
            <Link
              href="/student/login"
              className="text-sm font-semibold text-[#d4af37] transition hover:text-[#f1d77a]"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-zinc-600">
          Secure account recovery · Techvora Academy
        </p>
      </div>
    </main>
  );
}
