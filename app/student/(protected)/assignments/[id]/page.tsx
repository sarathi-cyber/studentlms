import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  courses,
  enrollments,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import AssignmentSubmissionForm from "./assignment-submission-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssignmentDetailPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/student/login");
  }

  if (user.role !== "student") {
    redirect("/admin");
  }

  const { id } = await params;

  const result = await db
    .select({
      assignmentId: assignments.id,
      courseId: assignments.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      title: assignments.title,
      description: assignments.description,
      instructions: assignments.instructions,
      maxMarks: assignments.maxMarks,
      dueAt: assignments.dueAt,
      submissionId: assignmentSubmissions.id,
      submissionUrl: assignmentSubmissions.submissionUrl,
      submissionText: assignmentSubmissions.submissionText,
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
        eq(assignmentSubmissions.assignmentId, assignments.id),
        eq(assignmentSubmissions.userId, user.id),
      ),
    )
    .where(
      and(
        eq(assignments.id, id),
        eq(assignments.isPublished, true),
        eq(courses.isPublished, true),
      ),
    )
    .limit(1);

  const assignment = result[0];

  if (!assignment) {
    notFound();
  }

  const enrollment = await db
    .select({
      id: enrollments.id,
      status: enrollments.status,
      endAt: courses.endAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, assignment.courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment[0]) {
    redirect("/student/assignments");
  }

  if (
    enrollment[0].endAt &&
    enrollment[0].endAt.getTime() <= Date.now()
  ) {
    redirect("/student/assignments");
  }

  const isGraded =
    assignment.marks !== null && assignment.gradedAt !== null;

  const isSubmitted = assignment.submissionId !== null;

  const isOverdue =
    assignment.dueAt !== null &&
    assignment.dueAt.getTime() < Date.now() &&
    !isGraded;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <a
          href="/student/assignments"
          className="text-sm font-medium text-[#d4af37] transition hover:text-[#f1d77a]"
        >
          ← Back to Assignments
        </a>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                {assignment.courseTitle}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {assignment.title}
              </h1>
            </div>

            <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37]">
              {assignment.maxMarks} Marks
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="Maximum Marks"
              value={`${assignment.maxMarks}`}
            />

            <InfoCard
              label="Due Date"
              value={
                assignment.dueAt
                  ? assignment.dueAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "No deadline"
              }
            />
          </div>

          {isOverdue && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              This assignment is past its submission deadline.
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-xl font-bold">
              Description
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/60">
              {assignment.description ||
                "No additional description has been provided."}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">
              Instructions
            </h2>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/65">
                {assignment.instructions ||
                  "Follow the assignment requirements and submit your completed work."}
              </p>
            </div>
          </section>

          {isGraded ? (
            <section className="mt-10 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Assignment Result
              </p>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-[#d4af37]">
                  {assignment.marks}
                </span>

                <span className="mb-1 text-lg text-white/40">
                  / {assignment.maxMarks}
                </span>
              </div>

              {assignment.gradedAt && (
                <p className="mt-3 text-xs text-white/40">
                  Graded on{" "}
                  {assignment.gradedAt.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}

              {assignment.feedback && (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                    Instructor Feedback
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/70">
                    {assignment.feedback}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <section className="mt-10">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                  {isSubmitted ? "Your Submission" : "Submit Your Work"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {isSubmitted
                    ? "Update Your Submission"
                    : "Assignment Submission"}
                </h2>

                {isSubmitted && assignment.submittedAt && (
                  <p className="mt-2 text-sm text-white/45">
                    Last submitted on{" "}
                    {assignment.submittedAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>

              <AssignmentSubmissionForm
                assignmentId={assignment.assignmentId}
                initialUrl={assignment.submissionUrl}
                initialText={assignment.submissionText}
                disabled={isOverdue}
                isSubmitted={isSubmitted}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-white/40">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}
