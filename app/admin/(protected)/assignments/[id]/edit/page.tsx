import EditAssignmentForm from "./edit-assignment-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAssignmentPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <EditAssignmentForm assignmentId={id} />;
}
