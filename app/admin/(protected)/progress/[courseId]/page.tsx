import ProgressManager from "./progress-manager";

type PageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseProgressPage({
  params,
}: PageProps) {
  const { courseId } = await params;

  return <ProgressManager courseId={courseId} />;
}
