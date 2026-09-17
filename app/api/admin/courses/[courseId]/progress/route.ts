import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  profiles,
  users,
} from "@/lib/db/schema";
import { updateLessonProgressSchema } from "@/lib/validation/lesson-progress";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

async function getCourseLessons(courseId: string) {
  return db
    .select({
      id: lessons.id,
      moduleId: courseModules.id,
      moduleTitle: courseModules.title,
      title: lessons.title,
      position: lessons.position,
      durationMinutes: lessons.durationMinutes,
      isPublished: lessons.isPublished,
    })
    .from(lessons)
    .innerJoin(
      courseModules,
      eq(lessons.moduleId, courseModules.id),
    )
    .where(
      and(
        eq(courseModules.courseId, courseId),
        eq(lessons.isPublished, true),
      ),
    )
    .orderBy(courseModules.position, lessons.position);
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const { courseId } = await context.params;

    const course = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        isPublished: courses.isPublished,
        startAt: courses.startAt,
        endAt: courses.endAt,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 },
      );
    }

    const lessonsForCourse = await getCourseLessons(courseId);

    const enrollmentRows = await db
      .select({
        enrollmentId: enrollments.id,
        userId: users.id,
        email: users.email,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        approvedAt: enrollments.approvedAt,
        completedAt: enrollments.completedAt,
        expiredAt: enrollments.expiredAt,
        cancelledAt: enrollments.cancelledAt,
        terminationReason: enrollments.terminationReason,
        reEnrollmentRequestedAt:
          enrollments.reEnrollmentRequestedAt,
        fullName: profiles.fullName,
        profileImage: profiles.profileImage,
        educationLevel: profiles.educationLevel,
        classOrYear: profiles.classOrYear,
        institution: profiles.institution,
        schoolOrCollege: profiles.schoolOrCollege,
        parentGuardianName: profiles.parentGuardianName,
        parentGuardianContact: profiles.parentGuardianContact,
        parentConsent: profiles.parentConsent,
        profileCompleted: profiles.profileCompleted,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          eq(enrollments.courseId, courseId),
          inArray(enrollments.status, [
            "pending",
            "active",
            "completed",
            "expired",
            "cancelled",
          ]),
        ),
      )
      .orderBy(enrollments.enrolledAt);

    // A student can have historical cancelled enrollments after
    // re-enrollment. The Course Group represents each student once,
    // using their latest enrollment record.
    const courseEnrollments = Array.from(
      enrollmentRows.reduce(
        (map, enrollment) => {
          map.set(enrollment.userId, enrollment);
          return map;
        },
        new Map<
          string,
          (typeof enrollmentRows)[number]
        >(),
      ).values(),
    );

    const userIds = [
      ...new Set(courseEnrollments.map((enrollment) => enrollment.userId)),
    ];

    const progressRows =
      userIds.length > 0
        ? await db
            .select({
              userId: lessonProgress.userId,
              lessonId: lessonProgress.lessonId,
              progressPercent: lessonProgress.progressPercent,
              completedAt: lessonProgress.completedAt,
              lastAccessedAt: lessonProgress.lastAccessedAt,
            })
            .from(lessonProgress)
            .where(inArray(lessonProgress.userId, userIds))
        : [];

    const progressMap = new Map(
      progressRows.map((row) => [
        `${row.userId}:${row.lessonId}`,
        row,
      ]),
    );

    const students = courseEnrollments.map((enrollment) => {
      const lessonData = lessonsForCourse.map((lesson) => {
        const progress = progressMap.get(
          `${enrollment.userId}:${lesson.id}`,
        );

        return {
          lessonId: lesson.id,
          moduleId: lesson.moduleId,
          moduleTitle: lesson.moduleTitle,
          title: lesson.title,
          position: lesson.position,
          durationMinutes: lesson.durationMinutes,
          progressPercent: progress?.progressPercent ?? 0,
          completedAt: progress?.completedAt ?? null,
          lastAccessedAt: progress?.lastAccessedAt ?? null,
        };
      });

      const overallProgress =
        lessonData.length > 0
          ? Math.round(
              lessonData.reduce(
                (total, lesson) =>
                  total + lesson.progressPercent,
                0,
              ) / lessonData.length,
            )
          : 0;

      return {
        enrollmentId: enrollment.enrollmentId,
        userId: enrollment.userId,
        email: enrollment.email,
        fullName: enrollment.fullName,
        profileImage: enrollment.profileImage,
        educationLevel: enrollment.educationLevel,
        classOrYear: enrollment.classOrYear,
        institution: enrollment.institution,
        schoolOrCollege: enrollment.schoolOrCollege,
        parentGuardianName: enrollment.parentGuardianName,
        parentGuardianContact:
          enrollment.parentGuardianContact,
        parentConsent: enrollment.parentConsent,
        profileCompleted: enrollment.profileCompleted,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        approvedAt: enrollment.approvedAt,
        completedAt: enrollment.completedAt,
        expiredAt: enrollment.expiredAt,
        cancelledAt: enrollment.cancelledAt,
        terminationReason: enrollment.terminationReason,
        reEnrollmentRequestedAt:
          enrollment.reEnrollmentRequestedAt,
        overallProgress,
        lessons: lessonData,
      };
    });

    return NextResponse.json(
      {
        course: course[0],
        group: {
          courseId,
          name: `${course[0].title} - Student Group`,
          studentCount: students.length,
          activeStudentCount: students.filter(
            (student) => student.status === "active",
          ).length,
        },
        lessons: lessonsForCourse,
        students,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "GET admin course group progress error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const { courseId } = await context.params;

    const body = await request.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId
        : "";

    const parsed = updateLessonProgressSchema.safeParse({
      progressPercent: body?.progressPercent,
    });

    if (!userId || !parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request data.",
          details: parsed.success
            ? {
                userId: ["A valid userId is required."],
              }
            : parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const lessonId =
      typeof body?.lessonId === "string"
        ? body.lessonId
        : "";

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "A valid lessonId is required.",
        },
        { status: 400 },
      );
    }

    const course = await db
      .select({
        id: courses.id,
        title: courses.title,
        isPublished: courses.isPublished,
        endAt: courses.endAt,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 },
      );
    }

    if (!course[0].isPublished) {
      return NextResponse.json(
        { error: "Course is not published." },
        { status: 404 },
      );
    }

    const lesson = await db
      .select({
        lessonId: lessons.id,
        courseId: courses.id,
        isPublished: lessons.isPublished,
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
          eq(courses.id, courseId),
        ),
      )
      .limit(1);

    if (
      lesson.length === 0 ||
      !lesson[0].isPublished
    ) {
      return NextResponse.json(
        { error: "Lesson not found in this course." },
        { status: 404 },
      );
    }

    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
      ),
      orderBy: (table, { desc }) => [desc(table.enrolledAt)],
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student is not enrolled in this course." },
        { status: 404 },
      );
    }

    if (
      enrollment.status !== "active" &&
      enrollment.status !== "completed"
    ) {
      return NextResponse.json(
        {
          error:
            "Progress can only be managed for active or completed enrollments.",
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const progressPercent = parsed.data.progressPercent;

    const existing = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    });

    let savedProgress;

    if (existing) {
      const updated = await db
        .update(lessonProgress)
        .set({
          progressPercent,
          completedAt:
            progressPercent === 100
              ? existing.completedAt ?? now
              : null,
          lastAccessedAt: now,
        })
        .where(eq(lessonProgress.id, existing.id))
        .returning();

      savedProgress = updated[0];
    } else {
      const inserted = await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          progressPercent,
          completedAt:
            progressPercent === 100 ? now : null,
          lastAccessedAt: now,
        })
        .returning();

      savedProgress = inserted[0];
    }

    const publishedLessons = await db
      .select({
        id: lessons.id,
      })
      .from(lessons)
      .innerJoin(
        courseModules,
        eq(lessons.moduleId, courseModules.id),
      )
      .where(
        and(
          eq(courseModules.courseId, courseId),
          eq(lessons.isPublished, true),
        ),
      );

    const studentProgressRows = await db
      .select({
        lessonId: lessonProgress.lessonId,
        progressPercent: lessonProgress.progressPercent,
      })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));

    const progressMap = new Map(
      studentProgressRows.map((row) => [
        row.lessonId,
        row.progressPercent,
      ]),
    );

    const allLessonsCompleted =
      publishedLessons.length > 0 &&
      publishedLessons.every(
        (publishedLesson) =>
          progressMap.get(publishedLesson.id) === 100,
      );

    if (allLessonsCompleted) {
      await db
        .update(enrollments)
        .set({
          status: "completed",
          completedAt: enrollment.completedAt ?? now,
        })
        .where(eq(enrollments.id, enrollment.id));
    } else if (
      enrollment.status === "completed" &&
      progressPercent < 100
    ) {
      await db
        .update(enrollments)
        .set({
          status: "active",
          completedAt: null,
        })
        .where(eq(enrollments.id, enrollment.id));
    }

    return NextResponse.json(
      {
        message:
          "Student lesson progress updated successfully.",
        courseId,
        userId,
        lessonId,
        progress: savedProgress,
        courseCompleted: allLessonsCompleted,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "PATCH admin course group progress error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
