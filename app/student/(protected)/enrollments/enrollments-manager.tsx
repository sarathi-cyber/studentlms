"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type EnrollmentStatus =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

type Enrollment = {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  terminationReason: string | null;
  reEnrollmentRequestedAt: string | null;
  courseTitle: string;
  courseSlug: string;
  courseStartAt: string | null;
  courseEndAt: string | null;
};

type Filter = "all" | EnrollmentStatus;

const filters: Array<{
  value: Filter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EnrollmentsManager() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEnrollments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to load enrollments.");
        return;
      }

      setEnrollments(data.enrollments ?? []);
    } catch {
      setError(
        "A network error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEnrollments();
  }, []);

  const counts = useMemo(() => {
    return {
      all: enrollments.length,
      pending: enrollments.filter(
        (item) => item.status === "pending",
      ).length,
      active: enrollments.filter(
        (item) => item.status === "active",
      ).length,
      completed: enrollments.filter(
        (item) => item.status === "completed",
      ).length,
      expired: enrollments.filter(
        (item) => item.status === "expired",
      ).length,
      cancelled: enrollments.filter(
        (item) => item.status === "cancelled",
      ).length,
    };
  }, [enrollments]);

  const visibleEnrollments = useMemo(() => {
    if (filter === "all") {
      return enrollments;
    }

    return enrollments.filter(
      (item) => item.status === filter,
    );
  }, [enrollments, filter]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
            Student Portal
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            My Enrollments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Track your course enrollment requests, approvals,
            learning status, and enrollment history.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                filter === item.value
                  ? "border-[#d4af37]/40 bg-[#d4af37]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                  filter === item.value
                    ? "text-[#d4af37]"
                    : "text-white/40"
                }`}
              >
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-black">
                {counts[item.value]}
              </p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />

            <p className="mt-4 text-sm text-white/45">
              Loading your enrollments...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadEnrollments()}
              className="mt-5 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#e2c45a]"
            >
              Try Again
            </button>
          </div>
        ) : visibleEnrollments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-2xl text-[#d4af37]">
              ▤
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No {filter === "all" ? "" : filter} enrollments
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
              {filter === "all"
                ? "You have not enrolled in any courses yet."
                : `You currently have no ${filter} enrollments.`}
            </p>

            <Link
              href="/student/courses"
              className="mt-6 inline-flex rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e2c45a]"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {visibleEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EnrollmentCard({
  enrollment,
}: {
  enrollment: Enrollment;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-[#d4af37]/20">
      <div className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={enrollment.status} />
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              {enrollment.courseTitle}
            </h2>

            <p className="mt-2 text-xs text-white/30">
              Course ID: {enrollment.courseId}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {enrollment.status === "active" && (
              <Link
                href={`/student/courses/${enrollment.courseSlug}`}
                className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e2c45a]"
              >
                Continue Learning
              </Link>
            )}

            {enrollment.status !== "active" && (
              <Link
                href={`/student/courses/${enrollment.courseSlug}`}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-[#d4af37]/30 hover:text-[#d4af37]"
              >
                View Course
              </Link>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <DateItem
            label="Enrolled"
            value={enrollment.enrolledAt}
          />

          <DateItem
            label="Approved"
            value={enrollment.approvedAt}
          />

          <DateItem
            label="Completed"
            value={enrollment.completedAt}
          />

          <DateItem
            label={
              enrollment.status === "cancelled"
                ? "Cancelled"
                : enrollment.status === "expired"
                  ? "Expired"
                  : "Course End"
            }
            value={
              enrollment.status === "cancelled"
                ? enrollment.cancelledAt
                : enrollment.status === "expired"
                  ? enrollment.expiredAt
                  : enrollment.courseEndAt
            }
          />
        </div>

        {enrollment.status === "pending" && (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
              Awaiting Approval
            </p>

            <p className="mt-1 text-sm text-white/50">
              Your enrollment request has been submitted and
              is waiting for administrator approval.
            </p>
          </div>
        )}

        {enrollment.status === "completed" && (
          <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#d4af37]">
              Course Completed
            </p>

            <p className="mt-1 text-sm text-white/50">
              Congratulations! You have completed this course.
            </p>
          </div>
        )}

        {enrollment.status === "expired" && (
          <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-400/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-300">
              Enrollment Expired
            </p>

            <p className="mt-1 text-sm text-white/50">
              The course enrollment period has ended before
              completion.
            </p>
          </div>
        )}

        {enrollment.status === "cancelled" && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-300">
              Enrollment Cancelled
            </p>

            {enrollment.terminationReason && (
              <p className="mt-2 text-sm leading-6 text-white/55">
                <span className="font-semibold text-white/70">
                  Reason:
                </span>{" "}
                {enrollment.terminationReason}
              </p>
            )}

            {enrollment.reEnrollmentRequestedAt && (
              <p className="mt-2 text-xs text-[#d4af37]">
                Re-enrollment request submitted on{" "}
                {formatDate(
                  enrollment.reEnrollmentRequestedAt,
                )}
              </p>
            )}
          </div>
        )}

        {enrollment.courseStartAt ||
        enrollment.courseEndAt ? (
          <div className="mt-5 text-xs text-white/35">
            Course schedule:{" "}
            {formatDate(enrollment.courseStartAt)} →{" "}
            {formatDate(enrollment.courseEndAt)}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: EnrollmentStatus;
}) {
  const styles: Record<EnrollmentStatus, string> = {
    pending:
      "border-amber-400/20 bg-amber-400/5 text-amber-300",
    active:
      "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    completed:
      "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]",
    expired:
      "border-orange-400/20 bg-orange-400/5 text-orange-300",
    cancelled:
      "border-red-400/20 bg-red-400/5 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function DateItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white/70">
        {formatDate(value)}
      </p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
