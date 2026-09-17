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
  courseId: string;
  courseTitle: string;
  coursePublished: boolean;
  title: string;
  description: string | null;
  instructions: string | null;
  maxMarks: number;
  dueAt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submissions: Submission[];
};

type Props = {
  assignmentId: string;
};

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export default function AssignmentManager({ assignmentId }: Props) {
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function loadAssignment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/assignments/${assignmentId}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load assignment.");
      }

      setAssignment(data.assignment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load assignment.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  async function handleDelete() {
    if (!assignment) return;

    const confirmed = window.confirm(
      `Delete "${assignment.title}"?\n\nThis will permanently delete the assignment and all associated submissions. This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/admin/assignments/${assignmentId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete assignment.");
      }

      router.push("/admin/assignments");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete assignment.",
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-10 text-center text-zinc-500">
            Loading assignment...
          </div>
        </div>
      </main>
    );
  }

  if (error && !assignment) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/assignments"
            className="inline-flex text-sm text-[#d4af37] transition hover:text-white"
          >
            ← Back to Assignments
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!assignment) return null;

  const totalSubmissions = assignment.submissions.length;

  const gradedCount = assignment.submissions.filter(
    (submission) => submission.gradedAt !== null,
  ).length;

  const awaitingCount = assignment.submissions.filter(
    (submission) =>
      submission.submittedAt !== null && submission.gradedAt === null,
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <header className="mb-10">
          <Link
            href="/admin/assignments"
            className="inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-[#d4af37]"
          >
            ← Back to Assignments
          </Link>

          <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    assignment.isPublished
                      ? "border border-green-500/20 bg-green-500/10 text-green-300"
                      : "border border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
                  ].join(" ")}
                >
                  {assignment.isPublished ? "Published" : "Draft"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
                  {assignment.courseTitle}
                </span>
              </div>

              <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {assignment.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500 sm:text-base">
                Manage assignment details, review student submissions, and
                evaluate submitted work.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
              <Link
                href={`/admin/assignments/${assignment.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/10"
              >
                Edit Assignment
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Assignment"}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Maximum Marks"
            value={assignment.maxMarks}
            description="Available for this assignment"
          />

          <StatCard
            label="Submissions"
            value={totalSubmissions}
            description="Total student submissions"
          />

          <StatCard
            label="Awaiting Grading"
            value={awaitingCount}
            description="Submitted but not evaluated"
          />

          <StatCard
            label="Graded"
            value={gradedCount}
            description="Submissions already evaluated"
          />
        </section>

        {/* Assignment Information */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold">Assignment Information</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Core details and instructions for students.
            </p>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Description
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {assignment.description || "No description provided."}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Instructions
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {assignment.instructions || "No instructions provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 border-t border-white/10 px-6 py-7 sm:px-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Course
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {assignment.courseTitle}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Course Status
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {assignment.coursePublished ? "Published" : "Unpublished"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Due Date
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(assignment.dueAt)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Maximum Marks
              </p>
              <p className="mt-2 text-sm font-medium text-[#d4af37]">
                {assignment.maxMarks}
              </p>
            </div>
          </div>
        </section>

        {/* Submissions */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Student Submissions</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Review and grade work submitted by enrolled students.
                </p>
              </div>

              <span className="self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 sm:self-auto">
                {totalSubmissions}{" "}
                {totalSubmissions === 1 ? "Submission" : "Submissions"}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {totalSubmissions === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-6 py-14 text-center">
                <p className="text-lg font-medium text-zinc-400">
                  No submissions yet
                </p>

                <p className="mt-2 text-sm text-zinc-600">
                  Student submissions will appear here once they are
                  submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignment.submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-7"
                  >
                    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-semibold text-white">
                          {submission.studentName || "Student"}
                        </h3>

                        <p className="mt-1 break-all text-sm text-zinc-500">
                          {submission.studentEmail}
                        </p>

                        <p className="mt-3 text-xs text-zinc-600">
                          Submitted: {formatDate(submission.submittedAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        {submission.gradedAt ? (
                          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300">
                            Graded
                          </span>
                        ) : (
                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-300">
                            Awaiting Grading
                          </span>
                        )}

                        {submission.marks !== null && (
                          <span className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2 text-sm font-bold text-[#d4af37]">
                            {submission.marks}/{assignment.maxMarks}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                      {submission.submissionText && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                            Submission Text
                          </p>

                          <div className="mt-3 min-h-32 rounded-xl border border-white/10 bg-[#080808] p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                              {submission.submissionText}
                            </p>
                          </div>
                        </div>
                      )}

                      {submission.submissionUrl && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                            Submission URL
                          </p>

                          <div className="mt-3 rounded-xl border border-white/10 bg-[#080808] p-5">
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
                    </div>

                    {submission.feedback && (
                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                          Feedback
                        </p>

                        <div className="mt-3 rounded-xl border border-white/10 bg-[#080808] p-5">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                            {submission.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-zinc-600">
                        {submission.gradedAt
                          ? `Graded: ${formatDate(submission.gradedAt)}`
                          : "This submission is ready for evaluation."}
                      </div>

                      <Link
                        href={`/admin/assignments/${assignment.id}/submissions/${submission.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e0bd4f]"
                      >
                        {submission.gradedAt
                          ? "View Grade"
                          : "Grade Submission"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="h-8" />
      </div>
    </main>
  );
}
