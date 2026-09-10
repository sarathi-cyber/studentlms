"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type Filter = "all" | "published" | "draft";

function formatDuration(minutes: number) {
  if (minutes <= 0) return "Not set";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} hr`;

  return `${hours} hr ${remaining} min`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load courses.");
      }

      setCourses(data.courses ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load courses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function togglePublished(course: Course) {
    setActionLoading(course.id);
    setError("");

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isPublished: !course.isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update course.",
        );
      }

      setCourses((current) =>
        current.map((item) =>
          item.id === course.id
            ? {
                ...item,
                ...data.course,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update course.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionLoading(course.id);
    setError("");

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete course.",
        );
      }

      setCourses((current) =>
        current.filter((item) => item.id !== course.id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete course.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.slug.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && course.isPublished) ||
        (filter === "draft" && !course.isPublished);

      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter]);

  const publishedCount = courses.filter(
    (course) => course.isPublished,
  ).length;

  const draftCount = courses.length - publishedCount;

  return (
    <div className="techvora-page min-h-screen">
      <div className="techvora-content min-h-screen">
        {/* Header */}
        <header className="border-b border-[#242424] bg-[#0b0b0b]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-10">
            <div className="pl-14 lg:pl-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                Administration
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Course Management
              </h1>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-[#242424] bg-[#101010] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              ← Dashboard
            </Link>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-10">
          {/* Page intro */}
          <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-zinc-600">
                Create, publish and manage courses.
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Courses
              </h2>
            </div>

            <Link
              href="/admin/courses/new"
              className="techvora-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold"
            >
              + Create Course
            </Link>
          </section>

          {/* Statistics */}
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Courses"
              value={courses.length}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />

            <SummaryCard
              label="Published"
              value={publishedCount}
              active={filter === "published"}
              onClick={() => setFilter("published")}
            />

            <SummaryCard
              label="Drafts"
              value={draftCount}
              active={filter === "draft"}
              onClick={() => setFilter("draft")}
            />
          </section>

          {/* Search and filter */}
          <section className="mt-8 rounded-2xl border border-[#242424] bg-[#0b0b0b] p-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="course-search"
                  className="sr-only"
                >
                  Search courses
                </label>

                <input
                  id="course-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by course title, slug or level..."
                  className="techvora-input w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="flex rounded-xl border border-[#242424] bg-[#101010] p-1">
                {(["all", "published", "draft"] as Filter[]).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                        filter === item
                          ? "bg-[#d4af37] text-black"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Courses */}
          <section className="mt-6">
            {loading ? (
              <div className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#242424] border-t-[#d4af37]" />

                <p className="mt-4 text-sm text-zinc-600">
                  Loading courses...
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#242424] bg-[#0b0b0b] p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-2xl text-[#d4af37]">
                  +
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  {courses.length === 0
                    ? "No courses yet"
                    : "No matching courses"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  {courses.length === 0
                    ? "Create your first Techvora Academy course to begin building the LMS."
                    : "Try changing your search or filter."}
                </p>

                {courses.length === 0 && (
                  <Link
                    href="/admin/courses/new"
                    className="techvora-button mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
                  >
                    Create First Course
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <article
                    key={course.id}
                    className="group rounded-2xl border border-[#242424] bg-[#0b0b0b] p-5 transition-all duration-300 hover:border-[#d4af37]/30"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {course.title}
                          </h3>

                          {course.isPublished ? (
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-full border border-zinc-700 bg-zinc-800/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-zinc-700">
                          /{course.slug}
                        </p>

                        {course.description && (
                          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-500">
                            {course.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                          <span className="rounded-lg border border-[#242424] bg-[#101010] px-3 py-1.5 capitalize">
                            {course.level}
                          </span>

                          <span>
                            {formatDuration(
                              course.durationMinutes,
                            )}
                          </span>

                          <span>Created {formatDate(course.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="rounded-xl border border-[#242424] bg-[#101010] px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                        >
                          Manage
                        </Link>

                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="rounded-xl border border-[#242424] bg-[#101010] px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={actionLoading === course.id}
                          onClick={() =>
                            togglePublished(course)
                          }
                          className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2.5 text-xs font-semibold text-[#d4af37] transition hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading === course.id
                            ? "Updating..."
                            : course.isPublished
                              ? "Unpublish"
                              : "Publish"}
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === course.id}
                          onClick={() => deleteCourse(course)}
                          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-[#0b0b0b] p-6 text-left transition-all duration-300 ${
        active
          ? "border-[#d4af37]/40"
          : "border-[#242424] hover:border-[#d4af37]/20"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value.toLocaleString("en-IN")}
      </p>
    </button>
  );
}
