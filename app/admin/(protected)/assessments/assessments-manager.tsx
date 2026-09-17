"use client";

import { useState } from "react";

type Assessment = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number;
  passPercentage: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function AssessmentsManager({
  initialAssessments,
}: {
  initialAssessments: Assessment[];
}) {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [search, setSearch] = useState("");

  const filtered = assessments.filter((assessment) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      assessment.title.toLowerCase().includes(query) ||
      assessment.courseTitle.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
            Assessment Management
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">
                Assessments
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Create and manage assessments for your courses.
              </p>
            </div>

            <a
              href="/admin/assessments/new"
              className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e7c95c]"
            >
              + Create Assessment
            </a>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assessments or courses..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d4af37]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold">
              No assessments found
            </h2>

            <p className="mt-2 text-sm text-white/50">
              Create your first assessment to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((assessment) => (
              <div
                key={assessment.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          assessment.isPublished
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {assessment.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>

                      <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                        {assessment.passPercentage}% Pass
                      </span>
                    </div>

                    <h2 className="text-xl font-bold">
                      {assessment.title}
                    </h2>

                    <p className="mt-1 text-sm text-[#d4af37]">
                      {assessment.courseTitle}
                    </p>

                    {assessment.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
                        {assessment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 text-sm text-white/50 md:items-end">
                    <span>
                      Duration:{" "}
                      <strong className="text-white">
                        {assessment.durationMinutes} min
                      </strong>
                    </span>

                    <a
                      href={`/admin/assessments/${assessment.id}`}
                      className="mt-2 rounded-lg border border-[#d4af37]/40 px-4 py-2 font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/10"
                    >
                      Manage Assessment
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-white/40">
          {filtered.length} assessment
          {filtered.length === 1 ? "" : "s"}
        </div>
      </div>
    </main>
  );
}
