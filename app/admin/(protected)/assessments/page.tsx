import { db } from "@/lib/db";
import { assessments, courses } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import AssessmentsManager from "./assessments-manager";

export default async function AssessmentsPage() {
  const results = await db
    .select({
      id: assessments.id,
      courseId: assessments.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      title: assessments.title,
      description: assessments.description,
      instructions: assessments.instructions,
      durationMinutes: assessments.durationMinutes,
      passPercentage: assessments.passPercentage,
      isPublished: assessments.isPublished,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    })
    .from(assessments)
    .innerJoin(courses, eq(assessments.courseId, courses.id))
    .orderBy(desc(assessments.createdAt));

  return <AssessmentsManager initialAssessments={results} />;
}
