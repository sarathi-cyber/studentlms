import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";

import CourseCatalogue from "./course-catalogue";

export default async function StudentCoursesPage() {
  const publishedCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      level: courses.level,
      durationMinutes: courses.durationMinutes,
    })
    .from(courses)
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.createdAt));

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="mb-10 border-b border-white/10 pb-8">
          <a
            href="/student/dashboard"
            className="mb-6 inline-flex text-sm text-white/50 transition hover:text-[#d4af37]"
          >
            ← Back to Dashboard
          </a>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#d4af37]">
            Techvora Academy
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Course Catalogue
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Explore our available courses and find the right learning
            path for you.
          </p>
        </header>

        <CourseCatalogue courses={publishedCourses} />
      </div>
    </main>
  );
}
