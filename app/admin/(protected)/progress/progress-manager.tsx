"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  durationMinutes: number;
  isPublished: boolean;
  startAt: string | null;
  endAt: string | null;
};

export default function ProgressManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/courses", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load courses.",
        );
      }

      setCourses(
        (data.courses ?? []).filter(
          (course: Course) => course.isPublished,
        ),
      );
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
    void loadCourses();
  }, []);

  function formatDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining > 0
      ? `${hours}h ${remaining}m`
      : `${hours}h`;
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37]">
              Student Progress
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Course Groups
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Manage enrolled students and control lesson progress
              for each course from the administration panel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadCourses()}
            disabled={loading}
            className="rounded-xl border border-[#292929] bg-[#101010] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#d4af37]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-10 text-center text-sm text-zinc-500">
            Loading course groups...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-[#242424] bg-[#0b0b0b] p-10 text-center">
            <p className="text-lg font-semibold text-white">
              No published courses
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Publish a course before managing its student group.
            </p>

            <Link
              href="/admin/courses"
              className="mt-5 inline-flex rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e0bd4f]"
            >
              Manage Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/admin/progress/${course.id}`}
                className="group rounded-2xl border border-[#242424] bg-[#0b0b0b] p-6 transition hover:-translate-y-0.5 hover:border-[#d4af37]/40 hover:bg-[#101010]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-xl text-[#d4af37]">
                    ◒
                  </div>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400">
                    Published
                  </span>
                </div>

                <h2 className="mt-6 text-xl font-bold text-white transition group-hover:text-[#d4af37]">
                  {course.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">
                  {course.description ||
                    "Manage the students enrolled in this course and control their learning progress."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-[#1f1f1f] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      Level
                    </p>
                    <p className="mt-1 text-sm capitalize text-zinc-300">
                      {course.level}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      Duration
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {formatDuration(course.durationMinutes)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    Open student group
                  </span>

                  <span className="font-bold text-[#d4af37] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
