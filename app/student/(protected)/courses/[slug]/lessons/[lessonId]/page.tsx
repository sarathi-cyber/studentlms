import { and, asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
} from "@/lib/db/schema";
import LessonProgress from "./lesson-progress";

type PageProps = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
};

export default async function LessonPlayerPage({
  params,
}: PageProps) {
  const { slug, lessonId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/student/login");
  }

  if (user.role !== "student") {
    notFound();
  }

  const result = await db
    .select({
      lesson: lessons,
      module: courseModules,
      course: courses,
    })
    .from(lessons)
    .innerJoin(
      courseModules,
      eq(lessons.moduleId, courseModules.id),
    )
    .innerJoin(
      courses,
      eq(courseModules.courseId, courses.id),
    )
    .where(
      and(
        eq(lessons.id, lessonId),
        eq(courses.slug, slug),
        eq(lessons.isPublished, true),
        eq(courses.isPublished, true),
      ),
    )
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const { lesson, module, course } = result[0];

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, course.id),
      eq(enrollments.status, "active"),
    ),
  });

  if (!enrollment) {
    redirect(`/student/courses/${course.slug}`);
  }

  const now = new Date();

  if (course.endAt && course.endAt <= now) {
    await db
      .update(enrollments)
      .set({
        status: "expired",
        expiredAt: enrollment.expiredAt ?? now,
      })
      .where(
        and(
          eq(enrollments.id, enrollment.id),
          eq(enrollments.status, "active"),
        ),
      );

    redirect(`/student/courses/${course.slug}`);
  }

  const progress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, user.id),
      eq(lessonProgress.lessonId, lesson.id),
    ),
  });

  const allLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      position: lessons.position,
    })
    .from(lessons)
    .innerJoin(
      courseModules,
      eq(lessons.moduleId, courseModules.id),
    )
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.isPublished, true),
      ),
    )
    .orderBy(
      asc(courseModules.position),
      asc(lessons.position),
    );

  const currentIndex = allLessons.findIndex(
    (item) => item.id === lesson.id,
  );

  const previousLesson =
    currentIndex > 0
      ? allLessons[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <a
            href={`/student/courses/${course.slug}`}
            className="text-sm text-white/50 transition hover:text-[#d4af37]"
          >
            ← Back to Course
          </a>

          <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">
            {module.title}
          </span>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {lesson.videoUrl ? (
            <div className="aspect-video w-full bg-black">
              <video
                className="h-full w-full"
                controls
                preload="metadata"
                src={lesson.videoUrl}
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center border-b border-white/10 bg-gradient-to-br from-[#211b08] via-black to-[#0d0d0d]">
              <span className="text-5xl font-black tracking-[0.25em] text-[#d4af37]/10">
                TECHVORA
              </span>
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/40">
              <span>Lesson {currentIndex + 1}</span>
              <span>•</span>
              <span>{formatDuration(lesson.durationMinutes)}</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {lesson.title}
            </h1>

            <p className="mt-2 text-sm text-[#d4af37]">
              {course.title}
            </p>

            {lesson.content ? (
              <article className="mt-8 whitespace-pre-wrap text-sm leading-8 text-white/70 sm:text-base">
                {lesson.content}
              </article>
            ) : (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/45">
                Lesson content has not been added yet.
              </div>
            )}

            <LessonProgress
              lessonId={lesson.id}
              initialProgress={progress?.progressPercent ?? 0}
              initialCompletedAt={
                progress?.completedAt?.toISOString() ?? null
              }
            />
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {previousLesson ? (
            <a
              href={`/student/courses/${course.slug}/lessons/${previousLesson.id}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#d4af37]/30 hover:bg-white/[0.05]"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-white/35">
                Previous Lesson
              </p>
              <p className="mt-2 font-semibold">
                ← {previousLesson.title}
              </p>
            </a>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <a
              href={`/student/courses/${course.slug}/lessons/${nextLesson.id}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#d4af37]/30 hover:bg-white/[0.05] sm:text-right"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-white/35">
                Next Lesson
              </p>
              <p className="mt-2 font-semibold">
                {nextLesson.title} →
              </p>
            </a>
          ) : (
            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5 sm:text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-[#d4af37]">
                Final Lesson
              </p>
              <p className="mt-2 font-semibold">
                Complete this lesson to finish the course.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
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
