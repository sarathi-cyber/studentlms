"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const requirements = useMemo(
    () => ({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const strength = Object.values(requirements).filter(Boolean).length;

  const strengthLabel =
    strength === 0
      ? "Enter a password"
      : strength <= 2
        ? "Weak"
        : strength === 3
          ? "Fair"
          : strength === 4
            ? "Good"
            : "Strong";

  const strengthWidth =
    strength === 0
      ? "0%"
      : strength === 1
        ? "20%"
        : strength === 2
          ? "40%"
          : strength === 3
            ? "60%"
            : strength === 4
              ? "80%"
              : "100%";

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (strength < 5) {
      setError(
        "Please create a password that meets all the requirements.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to reset your password. Please try again.",
        );
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
          <Link href="/login" className="inline-block">
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
          {!success ? (
            <>
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                  Account Recovery
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                  Reset your password
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Create a new secure password for your Techvora
                  Academy account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={128}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create a strong password"
                      className="techvora-input w-full rounded-xl px-4 py-3.5 pr-16 text-sm text-white outline-none placeholder:text-zinc-600"
                    />

                    <PasswordToggle
                      visible={showPassword}
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-600">
                        Password strength
                      </span>

                      <span
                        className={
                          strength === 5
                            ? "font-semibold text-[#d4af37]"
                            : "text-zinc-500"
                        }
                      >
                        {strengthLabel}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#292929]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8f731d] via-[#d4af37] to-[#f1d77a] transition-all duration-500"
                        style={{ width: strengthWidth }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <PasswordRequirement
                      valid={requirements.length}
                      text="12+ characters"
                    />

                    <PasswordRequirement
                      valid={requirements.uppercase}
                      text="Uppercase"
                    />

                    <PasswordRequirement
                      valid={requirements.lowercase}
                      text="Lowercase"
                    />

                    <PasswordRequirement
                      valid={requirements.number}
                      text="Number"
                    />

                    <PasswordRequirement
                      valid={requirements.special}
                      text="Special character"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Re-enter your password"
                      className={`techvora-input w-full rounded-xl px-4 py-3.5 pr-16 text-sm text-white outline-none placeholder:text-zinc-600 ${
                        passwordsMatch
                          ? "border-[#d4af37]/50"
                          : ""
                      }`}
                    />

                    <PasswordToggle
                      visible={showConfirmPassword}
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                      label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    />
                  </div>

                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 animate-[page-enter_0.2s_ease-out] text-xs ${
                        passwordsMatch
                          ? "text-[#d4af37]"
                          : "text-red-400"
                      }`}
                    >
                      {passwordsMatch
                        ? "Passwords match."
                        : "Passwords do not match."}
                    </p>
                  )}
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
                      Resetting password...
                    </span>
                  ) : (
                    "Reset Password"
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
                Password reset successful
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Your password has been changed successfully. You can
                now sign in using your new password.
              </p>

              <Link
                href="/login"
                className="techvora-button mt-7 inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
              >
                Continue to Sign In
              </Link>
            </div>
          )}

          {!success && (
            <>
              <div className="techvora-divider mt-7 pt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#d4af37] transition hover:text-[#f1d77a]"
                >
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-zinc-600">
          Secure password recovery · Techvora Academy
        </p>
      </div>
    </main>
  );
}

function PasswordToggle({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={visible}
      className="group absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-all duration-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
    >
      <span
        className={`transition-all duration-300 ${
          visible
            ? "scale-110 rotate-0"
            : "scale-100 rotate-[-8deg]"
        }`}
      >
        {visible ? (
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
  );
}

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all duration-300 ${
        valid
          ? "border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]"
          : "border-[#292929] bg-[#080808] text-zinc-600"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] transition-all duration-300 ${
          valid
            ? "bg-[#d4af37] font-black text-black"
            : "border border-[#3a3a3a] text-transparent"
        }`}
      >
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}
