"use client";

import { useState } from "react";

type ReEnrollmentFormProps = {
  enrollmentId: string;
  courseTitle: string;
};

export default function ReEnrollmentForm({
  enrollmentId,
  courseTitle,
}: ReEnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReEnrollment() {
    const confirmed = window.confirm(
      `Request re-enrollment for "${courseTitle}"?\n\nA new enrollment request will be created and sent to the administrator for approval.`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/enrollments/${enrollmentId}/reenroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to submit the re-enrollment request.");
        return;
      }

      setMessage(
        data.message ??
          "Re-enrollment request submitted successfully. Please wait for administrator approval.",
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      setError(
        "A network error occurred. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-black/30 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            Want to continue learning?
          </p>
          <p className="mt-1 text-sm leading-6 text-white/50">
            You can request re-enrollment. A new enrollment request will be
            created and must be approved by an administrator.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReEnrollment}
          disabled={loading}
          className="shrink-0 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e2c45a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Request Re-enrollment"}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
