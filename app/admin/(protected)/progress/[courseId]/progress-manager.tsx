"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  position: number;
  durationMinutes: number;
  isPublished: boolean;
};

type StudentLesson = {
  lessonId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  position: number;
  durationMinutes: number;
  progressPercent: number;
  completedAt: string | null;
  lastAccessedAt: string | null;
};

type Student = {
  enrollmentId: string;
  userId: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  educationLevel: string | null;
  classOrYear: string | null;
  institution: string | null;
  schoolOrCollege: string | null;
  parentGuardianName: string | null;
  parentGuardianContact: string | null;
  parentConsent: boolean;
  profileCompleted: boolean;
  status:
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "cancelled";
  enrolledAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  terminationReason: string | null;
  reEnrollmentRequestedAt: string | null;
  overallProgress: number;
  lessons: StudentLesson[];
};

type Course = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  startAt: string | null;
  endAt: string | null;
};

type Group = {
  courseId: string;
  name: string;
  studentCount: number;
  activeStudentCount: number;
};

type ApiResponse = {
  course: Course;
  group: Group;
  lessons: Lesson[];
  students: Student[];
};

type ProgressManagerProps = {
  courseId: string;
};

const statusStyles: Record<Student["status"], string> = {
  pending:
    "border-amber-500/20 bg-amber-500/5 text-amber-400",
  active:
    "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  completed:
    "border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37]",
  expired:
    "border-orange-500/20 bg-orange-500/5 text-orange-400",
  cancelled:
    "border-red-500/20 bg-red-500/5 text-red-400",
};

export default function ProgressManager({
  courseId,
}: ProgressManagerProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Student["status"]
  >("all");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(
    null,
  );
  const [editingProgress, setEditingProgress] = useState<
    Record<string, number>
  >({});

  async function loadProgress() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/courses/${courseId}/progress`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to load course group.",
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load course group.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProgress();
  }, [courseId]);

  const filteredStudents = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return data.students.filter((student) => {
      const matchesStatus =
        statusFilter === "all" ||
        student.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        student.fullName,
        student.email,
        student.classOrYear,
        student.institution,
        student.schoolOrCollege,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        );
    });
  }, [data, search, statusFilter]);

  function formatDate(value: string | null) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getInitials(student: Student) {
    if (student.fullName?.trim()) {
      return student.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
    }

    return student.email.charAt(0).toUpperCase();
  }

  function progressKey(userId: string, lessonId: string) {
    return `${userId}:${lessonId}`;
  }

  function getEditingValue(
    student: Student,
    lesson: StudentLesson,
  ) {
    return (
      editingProgress[progressKey(student.userId, lesson.lessonId)] ??
      lesson.progressPercent
    );
  }

  function updateEditingValue(
    student: Student,
    lesson: StudentLesson,
    value: number,
  ) {
    const normalized = Math.max(
      0,
      Math.min(100, Math.round(value)),
    );

    setEditingProgress((current) => ({
      ...current,
      [progressKey(student.userId, lesson.lessonId)]:
        normalized,
    }));
  }

  async function saveProgress(
    student: Student,
    lesson: StudentLesson,
  ) {
    const value = getEditingValue(student, lesson);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/courses/${courseId}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: student.userId,
            lessonId: lesson.lessonId,
            progressPercent: value,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to update progress.",
        );
      }

      setSuccess(
        `${student.fullName || student.email}'s progress was updated successfully.`,
      );

      await loadProgress();

      setEditingProgress((current) => {
        const next = { ...current };
        delete next[
          progressKey(student.userId, lesson.lessonId)
        ];
        return next;
      });

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update progress.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-12 text-center text-sm text-zinc-500">
            Loading course group...
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/progress"
            className="text-sm text-zinc-500 transition hover:text-[#d4af37]"
          >
            ← Back to Course Groups
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-sm text-red-400">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const statusCounts = {
    all: data.students.length,
    pending: data.students.filter(
      (student) => student.status === "pending",
    ).length,
    active: data.students.filter(
      (student) => student.status === "active",
    ).length,
    completed: data.students.filter(
      (student) => student.status === "completed",
    ).length,
    expired: data.students.filter(
      (student) => student.status === "expired",
    ).length,
    cancelled: data.students.filter(
      (student) => student.status === "cancelled",
    ).length,
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/progress"
          className="inline-flex items-center text-sm text-zinc-500 transition hover:text-[#d4af37]"
        >
          ← Course Groups
        </Link>

        <div className="mt-6 rounded-2xl border border-[#242424] bg-[#0b0b0b] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                Course Group
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {data.course.title}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {data.group.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#242424] bg-[#101010] px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Students
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {data.group.studentCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#242424] bg-[#101010] px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Active
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-400">
                  {data.group.activeStudentCount}
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-[#242424] bg-[#101010] px-5 py-4 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Lessons
                </p>
                <p className="mt-1 text-2xl font-black text-[#d4af37]">
                  {data.lessons.length}
                </p>
              </div>
            </div>
          </div>

          {(data.course.startAt || data.course.endAt) && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#1f1f1f] pt-5 text-xs text-zinc-500">
              {data.course.startAt && (
                <span>
                  Starts:{" "}
                  <strong className="text-zinc-300">
                    {formatDate(data.course.startAt)}
                  </strong>
                </span>
              )}

              {data.course.endAt && (
                <span>
                  Ends:{" "}
                  <strong className="text-zinc-300">
                    {formatDate(data.course.endAt)}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#242424] bg-[#0b0b0b] p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-xl border border-[#292929] bg-[#101010] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#d4af37]/50"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | Student["status"],
                )
              }
              className="rounded-xl border border-[#292929] bg-[#101010] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#d4af37]/50"
            >
              <option value="all">
                All ({statusCounts.all})
              </option>
              <option value="pending">
                Pending ({statusCounts.pending})
              </option>
              <option value="active">
                Active ({statusCounts.active})
              </option>
              <option value="completed">
                Completed ({statusCounts.completed})
              </option>
              <option value="expired">
                Expired ({statusCounts.expired})
              </option>
              <option value="cancelled">
                Cancelled ({statusCounts.cancelled})
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-10 text-center">
              <p className="font-semibold text-white">
                No students found
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Try changing the search or status filter.
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const expanded =
                expandedStudent === student.enrollmentId;

              return (
                <section
                  key={student.enrollmentId}
                  className="overflow-hidden rounded-2xl border border-[#242424] bg-[#0b0b0b]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStudent(
                        expanded ? null : student.enrollmentId,
                      )
                    }
                    className="w-full px-5 py-5 text-left transition hover:bg-[#101010] sm:px-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt=""
                            className="h-12 w-12 rounded-full border border-[#d4af37]/20 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-sm font-black text-[#d4af37]">
                            {getInitials(student)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-bold text-white">
                              {student.fullName ||
                                "Unnamed Student"}
                            </h2>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${statusStyles[student.status]}`}
                            >
                              {student.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-zinc-500">
                            {student.email}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            Enrolled {formatDate(student.enrolledAt)}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-[220px] lg:w-64">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">
                            Overall Progress
                          </span>
                          <strong className="text-[#d4af37]">
                            {student.overallProgress}%
                          </strong>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
                          <div
                            className="h-full rounded-full bg-[#d4af37] transition-all"
                            style={{
                              width: `${student.overallProgress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <span className="text-xl text-zinc-600">
                        {expanded ? "⌃" : "⌄"}
                      </span>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-[#242424] px-5 py-6 sm:px-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-[#202020] bg-[#101010] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Education
                          </p>
                          <p className="mt-2 text-sm text-zinc-300">
                            {student.educationLevel || "—"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#202020] bg-[#101010] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Class / Year
                          </p>
                          <p className="mt-2 text-sm text-zinc-300">
                            {student.classOrYear || "—"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#202020] bg-[#101010] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Institution
                          </p>
                          <p className="mt-2 text-sm text-zinc-300">
                            {student.institution ||
                              student.schoolOrCollege ||
                              "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                              Lesson Progress
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-white">
                              Admin Control
                            </h3>
                          </div>

                          <p className="text-xs text-zinc-600">
                            Only administrators can modify progress.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {student.lessons.map((lesson) => {
                            const value = getEditingValue(
                              student,
                              lesson,
                            );
                            const changed =
                              value !== lesson.progressPercent;

                            return (
                              <div
                                key={lesson.lessonId}
                                className="rounded-xl border border-[#202020] bg-[#101010] p-4"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                                      {lesson.moduleTitle}
                                    </p>

                                    <p className="mt-1 font-semibold text-zinc-200">
                                      {lesson.title}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                      {lesson.durationMinutes} min
                                    </p>
                                  </div>

                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={value}
                                        onChange={(event) =>
                                          updateEditingValue(
                                            student,
                                            lesson,
                                            Number(
                                              event.target.value,
                                            ),
                                          )
                                        }
                                        className="w-20 rounded-lg border border-[#292929] bg-[#090909] px-3 py-2 text-center text-sm font-bold text-[#d4af37] outline-none focus:border-[#d4af37]/50"
                                      />

                                      <span className="text-sm text-zinc-600">
                                        %
                                      </span>
                                    </div>

                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={value}
                                      onChange={(event) =>
                                        updateEditingValue(
                                          student,
                                          lesson,
                                          Number(
                                            event.target.value,
                                          ),
                                        )
                                      }
                                      className="w-full accent-[#d4af37] sm:w-40"
                                    />

                                    <button
                                      type="button"
                                      disabled={
                                        saving ||
                                        !changed
                                      }
                                      onClick={() =>
                                        void saveProgress(
                                          student,
                                          lesson,
                                        )
                                      }
                                      className="rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#e0bd4f] disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                      {saving
                                        ? "Saving..."
                                        : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {(student.status === "completed" ||
                        student.status === "cancelled" ||
                        student.status === "expired") && (
                        <div className="mt-5 rounded-xl border border-[#202020] bg-[#101010] p-4 text-xs text-zinc-500">
                          <strong className="text-zinc-300">
                            Enrollment history:
                          </strong>{" "}
                          {student.completedAt &&
                            `Completed ${formatDate(student.completedAt)}. `}
                          {student.cancelledAt &&
                            `Cancelled ${formatDate(student.cancelledAt)}. `}
                          {student.expiredAt &&
                            `Expired ${formatDate(student.expiredAt)}. `}
                          {student.terminationReason &&
                            `Reason: ${student.terminationReason}`}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
