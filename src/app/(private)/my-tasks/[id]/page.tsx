import TaskDetail from "@/components/pages/user/my-tasks/TaskDetail";

export const metadata = {
  title: "Task Detail | Asset Management System",
  description: "View specific task details",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
