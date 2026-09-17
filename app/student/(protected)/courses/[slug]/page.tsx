import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  courseModules,
  courses,
  enrollments,
  lessons,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import EnrollmentForm from "./enrollment-form";
import ReEnrollmentForm from "./re-enrollment-form";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CourseDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const user = await getCurrentUser();

  if (!user || user.role !== "student") {
    notFound();
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });

  if (!course || !course.isPublished) {
    notFound();
  }

  const enrollmentsForCourse = await db.query.enrollments.findMany({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, course.id),
    ),
    orderBy: (table, { desc }) => [desc(table.enrolledAt)],
  });

  const enrollment = enrollmentsForCourse[0];

  const now = new Date();

  let effectiveStatus = enrollment?.status ?? "none";

  if (
    enrollment?.status === "active" &&
    course.endAt &&
    course.endAt <= now
  ) {
    effectiveStatus = "expired";
  }

  const modules = await db
    .select({
      id: courseModules.id,
      title: courseModules.title,
      description: courseModules.description,
      position: courseModules.position,
    })
    .from(courseModules)
    .where(eq(courseModules.courseId, course.id))
    .orderBy(asc(courseModules.position));

  const lessonsByModule = await Promise.all(
    modules.map(async (module) => {
      const moduleLessons = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          slug: lessons.slug,
          durationMinutes: lessons.durationMinutes,
          position: lessons.position,
        })
        .from(lessons)
        .where(
          and(
            eq(lessons.moduleId, module.id),
            eq(lessons.isPublished, true),
          ),
        )
        .orderBy(asc(lessons.position));

      return {
        ...module,
        lessons: moduleLessons,
      };
    }),
  );

  const totalLessons = lessonsByModule.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <a
          href="/student/courses"
          className="mb-8 inline-flex text-sm text-white/50 transition hover:text-[#d4af37]"
        >
          ← Back to Course Catalogue
        </a>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="relative min-h-[280px] bg-gradient-to-br from-[#211b08] via-black to-[#0d0d0d]">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black tracking-[0.3em] text-[#d4af37]/10">
                  TECHVORA
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative flex min-h-[280px] items-end p-7 sm:p-10">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-[#d4af37]/30 bg-black/70 px-3 py-1 text-xs font-medium capitalize text-[#d4af37]">
                  {course.level}
                </span>

                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  {course.title}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                  {course.description ||
                    "Build practical programming skills with Techvora Academy."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-3">
            <CourseStat
              label="Level"
              value={capitalize(course.level)}
            />

            <CourseStat
              label="Duration"
              value={formatDuration(course.durationMinutes)}
            />

            <CourseStat
              label="Lessons"
              value={String(totalLessons)}
            />
          </div>
        </section>

        <section className="mt-8">
          {effectiveStatus === "none" && (
            <EnrollmentForm courseId={course.id} courseTitle={course.title} />
          )}

          {effectiveStatus === "pending" && (
            <StatusCard
              title="Enrollment Pending"
              description="Your enrollment request has been submitted and is waiting for administrator approval."
              label="Pending Approval"
            />
          )}

          {effectiveStatus === "active" && (
            <StatusCard
              title="You're enrolled"
              description="Your enrollment has been approved. You can now start learning this course."
              label="Start Learning"
            />
          )}

          {effectiveStatus === "completed" && (
            <StatusCard
              title="Course Completed"
              description="Congratulations! You have successfully completed this course."
              label="Completed"
            />
          )}

          {effectiveStatus === "expired" && (
            <StatusCard
              title="Course Access Expired"
              description="The course end date has passed before the course was completed."
              label="Expired"
            />
          )}

          {effectiveStatus === "cancelled" && enrollment && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 sm:p-8">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                    Enrollment Status
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Enrollment Cancelled
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    Your enrollment for this course has been cancelled by an
                    administrator.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                      Terminated On
                    </p>

                    <p className="mt-2 font-semibold text-white">
                      {enrollment.cancelledAt
                        ? formatDate(enrollment.cancelledAt)
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-white/40">
                      Reason
                    </p>

                    <p className="mt-2 font-semibold text-white">
                      {enrollment.terminationReason ||
                        "No termination reason was provided."}
                    </p>
                  </div>
                </div>

                <ReEnrollmentForm
                  enrollmentId={enrollment.id}
                  courseTitle={course.title}
                />
              </div>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Curriculum
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Course Content
            </h2>

            <p className="mt-2 text-sm text-white/50">
              {lessonsByModule.length}{" "}
              {lessonsByModule.length === 1 ? "module" : "modules"} ·{" "}
              {totalLessons}{" "}
              {totalLessons === 1 ? "lesson" : "lessons"}
            </p>
          </div>

          {lessonsByModule.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="text-lg font-semibold">
                Course content coming soon
              </h3>

              <p className="mt-2 text-sm text-white/50">
                The course has been published, but lessons have not
                been added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessonsByModule.map((module, moduleIndex) => (
                <details
                  key={module.id}
                  open={moduleIndex === 0}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <summary className="cursor-pointer list-none p-6 transition hover:bg-white/[0.03]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">
                          Module {moduleIndex + 1}
                        </p>

                        <h3 className="mt-1 text-lg font-bold">
                          {module.title}
                        </h3>

                        {module.description && (
                          <p className="mt-2 text-sm text-white/50">
                            {module.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-sm text-white/40 transition group-open:rotate-180">
                        ↓
                      </span>
                    </div>
                  </summary>

                  <div className="border-t border-white/10">
                    {module.lessons.length === 0 ? (
                      <p className="p-6 text-sm text-white/40">
                        No published lessons available yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {module.lessons.map(
                          (lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-4 px-6 py-5"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/50">
                                {lessonIndex + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <a
                                  href={`/student/courses/${course.slug}/lessons/${lesson.id}`}
                                  className="font-medium transition hover:text-[#d4af37]"
                                >
                                  {lesson.title}
                                </a>

                                <p className="mt-1 text-xs text-white/40">
                                  {formatDuration(
                                    lesson.durationMinutes,
                                  )}
                                </p>
                              </div>

                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                                Lesson
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Course Schedule
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Learning Period
              </h2>

              <p className="mt-2 text-sm text-white/50">
                {course.startAt
                  ? `Starts ${formatDate(course.startAt)}`
                  : "Start date not specified"}
                {" · "}
                {course.endAt
                  ? `Ends ${formatDate(course.endAt)}`
                  : "No end date specified"}
              </p>
            </div>

            <span className="rounded-xl border border-[#d4af37]/30 px-5 py-3 text-center text-sm font-semibold text-[#d4af37]">
              {capitalize(effectiveStatus)}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusCard({
  title,
  description,
  label,
}: {
  title: string;
  description: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            Enrollment Status
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-xl border border-[#d4af37]/30 px-5 py-3 text-center text-sm font-semibold text-[#d4af37]">
          {label}
        </span>
      </div>
    </div>
  );
}

function CourseStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/40">
        {label}
      </p>

      <p className="mt-2 font-semibold text-[#d4af37]">
        {value}
      </p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}
