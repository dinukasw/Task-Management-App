import { TaskHeader } from "@/components/tasks/task-header";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskPagination } from "@/components/tasks/task-pagination";

export const metadata = {
  title: "Tasks | TaskFlow",
};

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <TaskHeader />
      <div className="flex flex-col gap-2">
        <TaskTable />
        <TaskPagination />
      </div>
    </div>
  );
}