import GradeSubmissionForm from "./grade-submission-form";

type PageProps = {
  params: Promise<{
    id: string;
    submissionId: string;
  }>;
};

export default async function GradeSubmissionPage({
  params,
}: PageProps) {
  const { id, submissionId } = await params;

  return (
    <GradeSubmissionForm
      assignmentId={id}
      submissionId={submissionId}
    />
  );
}
