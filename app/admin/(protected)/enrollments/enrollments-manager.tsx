"use client";

import { useEffect, useMemo, useState } from "react";

type EnrollmentStatus =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

type Enrollment = {
  enrollmentId: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;

  enrolledAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  terminationReason: string | null;
  reEnrollmentRequestedAt: string | null;

  studentEmail: string;
  fullName: string | null;
  dateOfBirth: string | null;
  educationLevel: string | null;
  classOrYear: string | null;
  institution: string | null;
  schoolOrCollege: string | null;
  phone: string | null;
  parentGuardianName: string | null;
  parentGuardianContact: string | null;
  parentConsent: boolean;

  courseTitle: string;
  courseSlug: string;
  courseStartAt: string | null;
  courseEndAt: string | null;
};

const filters: Array<"all" | EnrollmentStatus> = [
  "all",
  "pending",
  "active",
  "completed",
  "expired",
  "cancelled",
];

export default function EnrollmentsManager() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState<"all" | EnrollmentStatus>("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [clearingTestData, setClearingTestData] = useState(false);

  const [terminationTarget, setTerminationTarget] =
    useState<Enrollment | null>(null);
  const [terminationReason, setTerminationReason] = useState("");

  async function loadEnrollments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/enrollments", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load enrollments.");
      }

      setEnrollments(data.enrollments ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load enrollments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEnrollments();
  }, []);

  async function clearTestData() {
    const confirmed = window.confirm(
      "Clear all development test enrollment logs for the Techvora test student? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setClearingTestData(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/enrollments/clear-test-data",
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to clear test enrollment logs.",
        );
      }

      await loadEnrollments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to clear test enrollment logs.",
      );
    } finally {
      setClearingTestData(false);
    }
  }

  async function approveEnrollment(enrollmentId: string) {
    if (
      !window.confirm(
        "Are you sure you want to approve this enrollment?",
      )
    ) {
      return;
    }

    setActionId(enrollmentId);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/enrollments/${enrollmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "active",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Enrollment approval failed.");
      }

      await loadEnrollments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Enrollment approval failed.",
      );
    } finally {
      setActionId(null);
    }
  }

  function openTerminationDialog(enrollment: Enrollment) {
    setTerminationTarget(enrollment);
    setTerminationReason("");
    setError("");
  }

  function closeTerminationDialog() {
    if (actionId) {
      return;
    }

    setTerminationTarget(null);
    setTerminationReason("");
  }

  async function terminateEnrollment() {
    if (!terminationTarget) {
      return;
    }

    const reason = terminationReason.trim();

    if (reason.length < 5) {
      setError(
        "Termination reason must be at least 5 characters.",
      );
      return;
    }

    if (reason.length > 1000) {
      setError(
        "Termination reason must not exceed 1000 characters.",
      );
      return;
    }

    setActionId(terminationTarget.enrollmentId);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/enrollments/${terminationTarget.enrollmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "cancelled",
            terminationReason: reason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Enrollment termination failed.");
      }

      setTerminationTarget(null);
      setTerminationReason("");

      await loadEnrollments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Enrollment termination failed.",
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredEnrollments = useMemo(() => {
    if (filter === "all") {
      return enrollments;
    }

    return enrollments.filter(
      (enrollment) => enrollment.status === filter,
    );
  }, [enrollments, filter]);

  const counts = useMemo(() => {
    return {
      all: enrollments.length,
      pending: enrollments.filter((item) => item.status === "pending").length,
      active: enrollments.filter((item) => item.status === "active").length,
      completed: enrollments.filter((item) => item.status === "completed").length,
      expired: enrollments.filter((item) => item.status === "expired").length,
      cancelled: enrollments.filter((item) => item.status === "cancelled").length,
    };
  }, [enrollments]);

  return (
    <div className="techvora-page min-h-screen">
      <div className="techvora-content min-h-screen">
        <header className="border-b border-[#242424] bg-[#0b0b0b]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between px-6 lg:px-10">
            <div className="pl-14 lg:pl-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                Administration
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Enrollment Management
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadEnrollments()}
                disabled={loading || clearingTestData}
                className="rounded-xl border border-[#292929] bg-[#101010] px-4 py-2 text-sm text-zinc-400 transition hover:border-[#d4af37]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              {process.env.NODE_ENV !== "production" && (
                <button
                  type="button"
                  onClick={() => void clearTestData()}
                  disabled={loading || clearingTestData}
                  className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:border-orange-400/40 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {clearingTestData
                    ? "Clearing..."
                    : "Clear Test Logs"}
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="px-6 py-8 lg:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Techvora LMS
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Enrollment control.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Review student enrollment requests, approve learners, and manage
              active enrollment lifecycle states.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  "rounded-xl border px-4 py-3 text-left transition",
                  filter === item
                    ? "border-[#d4af37]/40 bg-[#d4af37]/10"
                    : "border-[#242424] bg-[#101010] hover:border-[#d4af37]/20",
                ].join(" ")}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {item}
                </p>

                <p className="mt-1 text-2xl font-black text-[#d4af37]">
                  {counts[item]}
                </p>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="techvora-card rounded-2xl p-10 text-center">
              <p className="text-sm text-zinc-500">
                Loading enrollments...
              </p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="techvora-card rounded-2xl p-10 text-center">
              <p className="text-lg font-semibold text-white">
                No enrollments found
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                There are no enrollments matching the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollmentId}
                  enrollment={enrollment}
                  actionId={actionId}
                  onApprove={() =>
                    void approveEnrollment(enrollment.enrollmentId)
                  }
                  onTerminate={() => openTerminationDialog(enrollment)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {terminationTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="termination-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                Enrollment action
              </p>

              <h2
                id="termination-dialog-title"
                className="mt-2 text-2xl font-black text-white"
              >
                Terminate course
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                This will cancel the student&apos;s current enrollment.
                The termination reason will be saved and shown to the student.
              </p>
            </div>

            <div className="mb-5 rounded-xl border border-[#202020] bg-[#101010] p-4">
              <p className="text-sm font-semibold text-white">
                {terminationTarget.fullName || "Unnamed Student"}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {terminationTarget.studentEmail}
              </p>

              <p className="mt-3 text-sm text-[#d4af37]">
                {terminationTarget.courseTitle}
              </p>
            </div>

            <label
              htmlFor="termination-reason"
              className="block text-sm font-semibold text-zinc-200"
            >
              Reason for termination
              <span className="ml-1 text-red-400">*</span>
            </label>

            <textarea
              id="termination-reason"
              value={terminationReason}
              onChange={(event) => setTerminationReason(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Enter the reason for terminating this enrollment..."
              disabled={Boolean(actionId)}
              className="mt-2 w-full resize-none rounded-xl border border-[#292929] bg-[#101010] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/50 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <div className="mt-2 flex justify-between text-xs">
              <span
                className={
                  terminationReason.trim().length > 0 &&
                  terminationReason.trim().length < 5
                    ? "text-red-400"
                    : "text-zinc-600"
                }
              >
                Minimum 5 characters
              </span>

              <span className="text-zinc-600">
                {terminationReason.length}/1000
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeTerminationDialog}
                disabled={Boolean(actionId)}
                className="rounded-xl border border-[#292929] px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-[#444] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void terminateEnrollment()}
                disabled={
                  Boolean(actionId) ||
                  terminationReason.trim().length < 5
                }
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionId === terminationTarget.enrollmentId
                  ? "Terminating..."
                  : "Terminate Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  actionId,
  onApprove,
  onTerminate,
}: {
  enrollment: Enrollment;
  actionId: string | null;
  onApprove: () => void;
  onTerminate: () => void;
}) {
  const busy = actionId === enrollment.enrollmentId;

  return (
    <article className="techvora-card rounded-2xl p-5 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-white">
              {enrollment.fullName || "Unnamed Student"}
            </h3>

            <StatusBadge status={enrollment.status} />
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            {enrollment.studentEmail}
          </p>
        </div>

        <div className="flex gap-2">
          {enrollment.status === "pending" && (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={busy}
                className="rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#e0bf52] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Processing..." : "Approve"}
              </button>

              <button
                type="button"
                onClick={onTerminate}
                disabled={busy}
                className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}

          {enrollment.status === "active" && (
            <button
              type="button"
              onClick={onTerminate}
              disabled={busy}
              className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Processing..." : "Terminate"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-[#202020] pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Course" value={enrollment.courseTitle} />
        <Info label="Phone" value={enrollment.phone} />
        <Info label="Class / Year" value={enrollment.classOrYear} />
        <Info label="School / College" value={enrollment.schoolOrCollege} />
        <Info label="Education" value={enrollment.educationLevel} />
        <Info label="Parent / Guardian" value={enrollment.parentGuardianName} />
        <Info label="Parent Contact" value={enrollment.parentGuardianContact} />
        <Info
          label="Parent Consent"
          value={enrollment.parentConsent ? "Confirmed" : "Not confirmed"}
        />
      </div>

      {enrollment.status === "cancelled" && enrollment.terminationReason && (
        <div className="mt-5 rounded-xl border border-red-500/10 bg-red-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
            Termination reason
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {enrollment.terminationReason}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#202020] pt-4 text-xs text-zinc-600">
        <span>
          Requested: {formatDate(enrollment.enrolledAt)}
        </span>

        {enrollment.approvedAt && (
          <span>
            Approved: {formatDate(enrollment.approvedAt)}
          </span>
        )}

        {enrollment.cancelledAt && (
          <span>
            Terminated: {formatDate(enrollment.cancelledAt)}
          </span>
        )}

        {enrollment.courseStartAt && (
          <span>
            Course starts: {formatDate(enrollment.courseStartAt)}
          </span>
        )}

        {enrollment.courseEndAt && (
          <span>
            Course ends: {formatDate(enrollment.courseEndAt)}
          </span>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const labels: Record<EnrollmentStatus, string> = {
    pending: "PENDING",
    active: "ACTIVE",
    completed: "COMPLETED",
    expired: "EXPIRED",
    cancelled: "CANCELLED",
  };

  return (
    <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-[#d4af37]">
      {labels[status]}
    </span>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-zinc-300">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
