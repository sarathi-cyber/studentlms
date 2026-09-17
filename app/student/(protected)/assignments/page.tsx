import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { assignments, courses, enrollments, assignmentSubmissions } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/student/login");
  }

  if (user.role !== "student") {
    redirect("/admin");
  }

  const activeEnrollments = await db
    .select({
      courseId: enrollments.courseId,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.userId, user.id),
        eq(enrollments.status, "active"),
        eq(courses.isPublished, true),
      ),
    );

  const courseIds = activeEnrollments.map((item) => item.courseId);

  const assignmentRows =
    courseIds.length > 0
      ? await db
          .select({
            assignmentId: assignments.id,
            courseId: assignments.courseId,
            courseTitle: courses.title,
            courseSlug: courses.slug,
            title: assignments.title,
            description: assignments.description,
            maxMarks: assignments.maxMarks,
            dueAt: assignments.dueAt,
            submissionId: assignmentSubmissions.id,
            submittedAt: assignmentSubmissions.submittedAt,
            marks: assignmentSubmissions.marks,
            feedback: assignmentSubmissions.feedback,
            gradedAt: assignmentSubmissions.gradedAt,
          })
          .from(assignments)
          .innerJoin(courses, eq(assignments.courseId, courses.id))
          .leftJoin(
            assignmentSubmissions,
            and(
              eq(
                assignmentSubmissions.assignmentId,
                assignments.id,
              ),
              eq(assignmentSubmissions.userId, user.id),
            ),
          )
          .where(
            and(
              inArray(assignments.courseId, courseIds),
              eq(assignments.isPublished, true),
              eq(courses.isPublished, true),
            ),
          )
          .orderBy(desc(assignments.createdAt))
      : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
            Academic Work
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            My Assignments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            View your assignments, submit your work, and track marks and
            instructor feedback.
          </p>
        </div>

        {assignmentRows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold">
              No assignments available
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
              There are no published assignments available for your active
              courses right now.
            </p>

            <Link
              href="/student/courses"
              className="mt-6 inline-flex rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f1d77a]"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {assignmentRows.map((assignment) => {
              const isGraded =
                assignment.marks !== null &&
                assignment.gradedAt !== null;

              const isSubmitted =
                assignment.submissionId !== null;

              const isOverdue =
                assignment.dueAt !== null &&
                assignment.dueAt.getTime() < Date.now() &&
                !isGraded;

              let status = "Not Submitted";
              let statusClass =
                "border-white/10 bg-white/[0.04] text-white/60";

              if (isGraded) {
                status = "Graded";
                statusClass =
                  "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]";
              } else if (isSubmitted) {
                status = "Submitted • Awaiting Evaluation";
                statusClass =
                  "border-emerald-400/20 bg-emerald-400/5 text-emerald-300";
              } else if (isOverdue) {
                status = "Overdue";
                statusClass =
                  "border-red-400/20 bg-red-400/5 text-red-300";
              }

              return (
                <article
                  key={assignment.assignmentId}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#d4af37]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d4af37]">
                        {assignment.courseTitle}
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {assignment.title}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55">
                    {assignment.description ||
                      "Complete and submit this assignment according to the provided instructions."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs text-white/40">
                        Maximum Marks
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {assignment.maxMarks}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs text-white/40">
                        Due Date
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {assignment.dueAt
                          ? assignment.dueAt.toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "No deadline"}
                      </p>
                    </div>
                  </div>

                  {isGraded && assignment.marks !== null && (
                    <div className="mt-5 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                        Your Result
                      </p>

                      <p className="mt-2 text-3xl font-bold text-[#d4af37]">
                        {assignment.marks}
                        <span className="ml-1 text-base font-medium text-white/40">
                          / {assignment.maxMarks}
                        </span>
                      </p>

                      {assignment.feedback && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                            Instructor Feedback
                          </p>

                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {assignment.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/student/assignments/${assignment.assignmentId}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                  >
                    {isGraded
                      ? "View Assignment & Result"
                      : isSubmitted
                        ? "View Submission"
                        : "View & Submit Assignment"}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
