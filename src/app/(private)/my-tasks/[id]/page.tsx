import TaskDetail from "@/components/pages/user/my-tasks/TaskDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
