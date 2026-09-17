"use client";

import { useState } from "react";

type Props = {
  assignmentId: string;
  initialUrl: string | null;
  initialText: string | null;
  disabled: boolean;
  isSubmitted: boolean;
};

export default function AssignmentSubmissionForm({
  assignmentId,
  initialUrl,
  initialText,
  disabled,
  isSubmitted,
}: Props) {
  const [submissionUrl, setSubmissionUrl] = useState(initialUrl ?? "");
  const [submissionText, setSubmissionText] = useState(
    initialText ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!submissionUrl.trim() && !submissionText.trim()) {
      setError("Please provide a submission URL or submission text.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/student/assignments/${assignmentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionUrl: submissionUrl.trim() || undefined,
            submissionText: submissionText.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit assignment.");
        return;
      }

      setMessage(data.message || "Assignment submitted successfully.");
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div>
        <label
          htmlFor="submissionUrl"
          className="text-sm font-semibold text-white/80"
        >
          Submission URL
          <span className="ml-2 text-xs font-normal text-white/35">
            Optional
          </span>
        </label>

        <input
          id="submissionUrl"
          type="url"
          value={submissionUrl}
          onChange={(event) => setSubmissionUrl(event.target.value)}
          disabled={disabled || submitting}
          placeholder="https://github.com/your-project"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="submissionText"
          className="text-sm font-semibold text-white/80"
        >
          Submission Details
          <span className="ml-2 text-xs font-normal text-white/35">
            Optional if URL is provided
          </span>
        </label>

        <textarea
          id="submissionText"
          value={submissionText}
          onChange={(event) => setSubmissionText(event.target.value)}
          disabled={disabled || submitting}
          rows={8}
          placeholder="Describe or paste your completed work here..."
          className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-bold text-black transition hover:bg-[#f1d77a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : isSubmitted
            ? "Resubmit Assignment"
            : "Submit Assignment"}
      </button>

      {isSubmitted && !disabled && (
        <p className="mt-3 text-center text-xs text-white/35">
          You may update your submission until it has been graded.
        </p>
      )}
    </form>
  );
}
