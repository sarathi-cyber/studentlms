import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { courses, enrollments, lessonProgress } from "@/lib/db/schema";
import LogoutButton from "../components/logout-button";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/student/login");
  }

  if (user.role !== "student") {
    redirect("/admin");
  }

  const studentEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseDescription: courses.description,
      courseLevel: courses.level,
      courseDuration: courses.durationMinutes,
      thumbnailUrl: courses.thumbnailUrl,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, user.id))
    .orderBy(desc(enrollments.enrolledAt));

  const progressRows = await db
    .select({
      lessonId: lessonProgress.lessonId,
      progress: lessonProgress.progressPercent,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, user.id));

  const completedLessons = progressRows.filter(
    (item) => item.progress === 100,
  ).length;

  const totalProgress = progressRows.length
    ? Math.round(
        progressRows.reduce((sum, item) => sum + item.progress, 0) /
          progressRows.length,
      )
    : 0;

  const activeEnrollments = studentEnrollments.filter(
    (item) => item.status === "active",
  );

  const completedCourses = studentEnrollments.filter(
    (item) => item.status === "completed",
  );

  const firstName =
    user.email.split("@")[0].charAt(0).toUpperCase() +
    user.email.split("@")[0].slice(1);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-[#d4af37]">
              Techvora Academy
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Student Dashboard
            </h1>

            <p className="mt-2 text-sm text-white/60">
              Welcome back, {firstName}.
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Enrolled Courses"
            value={String(studentEnrollments.length)}
          />

          <StatCard
            label="Active Courses"
            value={String(activeEnrollments.length)}
          />

          <StatCard
            label="Completed Lessons"
            value={String(completedLessons)}
          />

          <StatCard
            label="Overall Progress"
            value={`${totalProgress}%`}
          />
        </section>

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Learning
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Continue Learning
              </h2>
            </div>

            <a
              href="/student/courses"
              className="text-sm font-medium text-[#d4af37] transition hover:text-[#f1d77a]"
            >
              Browse Courses →
            </a>
          </div>

          {activeEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="text-lg font-semibold">
                No courses yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
                You have not enrolled in any course yet. Explore the
                course catalogue and start learning.
              </p>

              <a
                href="/student/courses"
                className="mt-6 inline-flex rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f1d77a]"
              >
                Explore Courses
              </a>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {activeEnrollments.slice(0, 4).map((course) => (
                <article
                  key={course.enrollmentId}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-[#d4af37]/30"
                >
                  <div className="h-32 bg-gradient-to-br from-[#1a1608] via-black to-[#0d0d0d]">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.courseTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-2xl font-black text-[#d4af37]/30">
                          TECHVORA
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-1 text-xs capitalize text-[#d4af37]">
                        {course.courseLevel}
                      </span>

                      <span className="text-xs text-white/40">
                        {course.courseDuration} min
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">
                      {course.courseTitle}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                      {course.courseDescription ||
                        "Continue your learning journey with Techvora Academy."}
                    </p>

                    <a
                      href={`/student/courses/${course.courseSlug}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                    >
                      Continue Learning
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Account
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Your LMS
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardLink
              href="/student/courses"
              title="Course Catalogue"
              description="Explore available Techvora courses."
            />

            <DashboardLink
              href="/student/profile"
              title="My Profile"
              description="View and manage your student profile."
            />

            <DashboardLink
              href="/student/progress"
              title="Learning Progress"
              description="Track your lessons and course progress."
            />
          </div>
        </section>

        {completedCourses.length > 0 && (
          <section className="mt-10 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Achievement
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {completedCourses.length} course
              {completedCourses.length === 1 ? "" : "s"} completed
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Keep going—your completed courses will contribute to
              your learning record.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm text-white/50">{label}</p>

      <p className="mt-3 text-3xl font-bold text-[#d4af37]">
        {value}
      </p>
    </div>
  );
}

function DashboardLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#d4af37]/30 hover:bg-white/[0.05]"
    >
      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-white/50">
        {description}
      </p>

      <span className="mt-4 inline-block text-sm font-medium text-[#d4af37]">
        Open →
      </span>
    </a>
  );
}
