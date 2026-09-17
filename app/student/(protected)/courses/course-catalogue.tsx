"use client";

import { useMemo, useState } from "react";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: string;
  durationMinutes: number;
};

type Props = {
  courses: Course[];
};

export default function CourseCatalogue({ courses }: Props) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        (course.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesLevel =
        level === "all" || course.level === level;

      return matchesSearch && matchesLevel;
    });
  }, [courses, search, level]);

  return (
    <>
      <section className="mb-8 grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label
            htmlFor="course-search"
            className="mb-2 block text-sm font-medium text-white/70"
          >
            Search courses
          </label>

          <input
            id="course-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by course name or description..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30"
          />
        </div>

        <div>
          <label
            htmlFor="course-level"
            className="mb-2 block text-sm font-medium text-white/70"
          >
            Level
          </label>

          <select
            id="course-level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-white/50">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredCourses.length}
          </span>{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
        </p>

        {(search || level !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setLevel("all");
            }}
            className="text-sm font-medium text-[#d4af37] transition hover:text-[#f1d77a]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <h2 className="text-xl font-semibold">
            No courses found
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Try changing your search or level filter.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </section>
      )}
    </>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-white/[0.05]">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#1a1608] via-black to-[#0d0d0d]">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-black tracking-widest text-[#d4af37]/20">
              TECHVORA
            </span>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full border border-[#d4af37]/30 bg-black/80 px-3 py-1 text-xs font-medium capitalize text-[#d4af37] backdrop-blur">
          {course.level}
        </span>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/40">
          <span>{formatDuration(course.durationMinutes)}</span>

          <span>Techvora Academy</span>
        </div>

        <h2 className="text-xl font-bold leading-tight">
          {course.title}
        </h2>

        <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/50">
          {course.description ||
            "Build practical knowledge with Techvora Academy."}
        </p>

        <a
          href={`/student/courses/${course.slug}`}
          className="mt-6 flex w-full items-center justify-center rounded-xl border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
        >
          View Course
        </a>
      </div>
    </article>
  );
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "Duration not specified";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}
