import AssignmentManager from "./assignment-manager";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssignmentManagementPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <AssignmentManager assignmentId={id} />;
}
