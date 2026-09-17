"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  userId: string;
  studentName: string | null;
  studentEmail: string;
  submissionUrl: string | null;
  submissionText: string | null;
  submittedAt: string | null;
  marks: number | null;
  feedback: string | null;
  gradedAt: string | null;
};

type Assignment = {
  id: string;
  title: string;
  courseTitle: string;
  maxMarks: number;
  dueAt: string | null;
  isPublished: boolean;
  submission: Submission;
};

type Props = {
  assignmentId: string;
  submissionId: string;
};

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function GradeSubmissionForm({
  assignmentId,
  submissionId,
}: Props) {
  const router = useRouter();

  const [data, setData] = useState<Assignment | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSubmission() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/assignments/${assignmentId}/submissions/${submissionId}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load submission.",
        );
      }

      setData(result);

      const submission = result.submission;

      setMarks(
        submission.marks !== null
          ? String(submission.marks)
          : "",
      );

      setFeedback(submission.feedback ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load submission.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmission();
  }, [assignmentId, submissionId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!data) return;

    setError("");
    setSuccess("");

    const numericMarks = Number(marks);

    if (
      marks.trim() === "" ||
      !Number.isInteger(numericMarks)
    ) {
      setError("Marks must be a whole number.");
      return;
    }

    if (numericMarks < 0) {
      setError("Marks cannot be negative.");
      return;
    }

    if (numericMarks > data.maxMarks) {
      setError(
        `Marks cannot exceed ${data.maxMarks}.`,
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/assignments/${assignmentId}/submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            marks: numericMarks,
            feedback: feedback.trim() || null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save grade.",
        );
      }

      setSuccess("Grade saved successfully.");

      await loadSubmission();

      setTimeout(() => {
        router.push(`/admin/assignments/${assignmentId}`);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save grade.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-10 text-center text-zinc-500">
            Loading submission...
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/admin/assignments/${assignmentId}`}
            className="text-sm text-[#d4af37] hover:text-white"
          >
            ← Back to Assignment
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const submission = data.submission;
  const alreadyGraded = submission.gradedAt !== null;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-10">
          <Link
            href={`/admin/assignments/${assignmentId}`}
            className="inline-flex text-sm font-medium text-zinc-500 transition hover:text-[#d4af37]"
          >
            ← Back to Assignment
          </Link>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
              Assignment Evaluation
            </p>

            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
              Grade Submission
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {data.title} • {data.courseTitle}
            </p>
          </div>
        </header>

        {/* Student Information */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Student
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {submission.studentName || "Student"}
                </h2>

                <p className="mt-1 break-all text-sm text-zinc-500">
                  {submission.studentEmail}
                </p>
              </div>

              {alreadyGraded ? (
                <span className="self-start rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">
                  Already Graded
                </span>
              ) : (
                <span className="self-start rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300">
                  Awaiting Evaluation
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-7 sm:px-8 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Assignment
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {data.title}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Maximum Marks
              </p>
              <p className="mt-2 text-sm font-bold text-[#d4af37]">
                {data.maxMarks}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Submitted
              </p>
              <p className="mt-2 text-sm text-white">
                {formatDate(submission.submittedAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Submission */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold">
              Submitted Work
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Review the student's submitted content before assigning marks.
            </p>
          </div>

          <div className="space-y-7 p-6 sm:p-8">
            {submission.submissionText && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Submission Text
                </p>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-6">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {submission.submissionText}
                  </p>
                </div>
              </div>
            )}

            {submission.submissionUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Submission URL
                </p>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-6">
                  <a
                    href={submission.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm leading-7 text-[#d4af37] hover:underline"
                  >
                    {submission.submissionUrl}
                  </a>
                </div>
              </div>
            )}

            {!submission.submissionText &&
              !submission.submissionUrl && (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-600">
                  No submission content was provided.
                </div>
              )}
          </div>
        </section>

        {/* Grading */}
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold">
              Evaluation
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Assign marks and provide constructive feedback.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="marks"
                className="block text-sm font-semibold text-white"
              >
                Marks
              </label>

              <p className="mt-1 text-xs text-zinc-600">
                Enter a whole number between 0 and{" "}
                {data.maxMarks}.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <input
                  id="marks"
                  type="number"
                  min="0"
                  max={data.maxMarks}
                  step="1"
                  value={marks}
                  onChange={(event) =>
                    setMarks(event.target.value)
                  }
                  className="w-32 rounded-xl border border-white/10 bg-black px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-[#d4af37]/60"
                  required
                />

                <span className="text-lg font-semibold text-zinc-600">
                  / {data.maxMarks}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-semibold text-white"
              >
                Feedback
              </label>

              <p className="mt-1 text-xs text-zinc-600">
                Give the student useful comments about their work.
              </p>

              <textarea
                id="feedback"
                rows={7}
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                placeholder="Enter feedback for the student..."
                className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/60"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <Link
                href={`/admin/assignments/${assignmentId}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#e0bd4f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving Grade..."
                  : alreadyGraded
                    ? "Update Grade"
                    : "Save Grade"}
              </button>
            </div>
          </form>
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}
