"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  maxMarks: number;
  dueAt: string | null;
  isPublished: boolean;
  courseId: string;
  courseTitle?: string | null;
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;
};

type Filter = "all" | "published" | "draft";

export default function AssignmentsManager() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/assignments", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load assignments.");
      }

      setAssignments(data.assignments ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load assignments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !query ||
        assignment.title.toLowerCase().includes(query) ||
        (assignment.courseTitle ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && assignment.isPublished) ||
        (filter === "draft" && !assignment.isPublished);

      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const publishedCount = assignments.filter(
    (assignment) => assignment.isPublished,
  ).length;

  const draftCount = assignments.filter(
    (assignment) => !assignment.isPublished,
  ).length;

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-[#d4af37]">
              ADMINISTRATION
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Assignments
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/50">
              Create, manage, publish, and review course assignments.
            </p>
          </div>

          <Link
            href="/admin/assignments/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e3c354]"
          >
            + Create Assignment
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Assignments"
            value={assignments.length}
          />

          <StatCard
            label="Published"
            value={publishedCount}
          />

          <StatCard
            label="Drafts"
            value={draftCount}
          />
        </div>

        {/* Controls */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assignments or courses..."
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d4af37]/60 lg:max-w-md"
            />

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "published"}
                onClick={() => setFilter("published")}
              >
                Published
              </FilterButton>

              <FilterButton
                active={filter === "draft"}
                onClick={() => setFilter("draft")}
              >
                Drafts
              </FilterButton>

              <button
                type="button"
                onClick={loadAssignments}
                disabled={loading}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />
            <p className="text-sm text-white/50">
              Loading assignments...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredAssignments.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mb-4 text-4xl">▤</div>

            <h2 className="text-lg font-semibold">
              {assignments.length === 0
                ? "No assignments yet"
                : "No matching assignments"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
              {assignments.length === 0
                ? "Create your first assignment to start collecting student submissions."
                : "Try changing your search or filter."}
            </p>

            {assignments.length === 0 && (
              <Link
                href="/admin/assignments/new"
                className="mt-6 inline-flex rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e3c354]"
              >
                Create Assignment
              </Link>
            )}
          </div>
        )}

        {/* Assignment Cards */}
        {!loading && filteredAssignments.length > 0 && (
          <div className="grid gap-5">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-white/45">{label}</p>

      <p className="mt-2 text-3xl font-bold text-[#d4af37]">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#d4af37] text-black"
          : "border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: Assignment;
}) {
  const dueDate = assignment.dueAt
    ? new Date(assignment.dueAt).toLocaleString()
    : "No due date";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#d4af37]/30 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                assignment.isPublished
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {assignment.isPublished ? "Published" : "Draft"}
            </span>

            <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
              {assignment.maxMarks} Marks
            </span>
          </div>

          <h2 className="text-xl font-semibold">
            {assignment.title}
          </h2>

          <p className="mt-1 text-sm text-[#d4af37]">
            {assignment.courseTitle || "Course"}
          </p>

          {assignment.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/50">
              {assignment.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
            <span>Due: {dueDate}</span>

            <span>
              Submissions: {assignment.submissionCount ?? 0}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            href={`/admin/assignments/${assignment.id}`}
            className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-medium text-white transition hover:border-[#d4af37]/40 hover:bg-white/5"
          >
            Manage Assignment
          </Link>

          <Link
            href={`/admin/assignments/${assignment.id}`}
            className="rounded-xl bg-[#d4af37] px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-[#e3c354]"
          >
            View Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
