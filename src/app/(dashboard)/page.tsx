"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatTaskDate } from "@/lib/date";
import { AlertCircle } from "lucide-react";

// Task type matching API response (dates are serialized as strings)
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  userId: string;
  createdAt: string; // Serialized as ISO string from API
  updatedAt: string; // Serialized as ISO string from API
}

interface TaskResponse {
  success: boolean;
  data: Task[];
  error?: string;
}

// Fetch tasks from API
async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks");
  const data: TaskResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch tasks");
  }

  return data.data;
}

function getStatusBadgeClasses(status: "PENDING" | "COMPLETED" | "CANCELED"): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "COMPLETED":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "CANCELED":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "";
  }
}

export default function DashboardPage() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // Calculate statistics
  const totalTasks = tasks?.length || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "PENDING").length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "COMPLETED").length || 0;
  const canceledTasks = tasks?.filter((t) => t.status === "CANCELED").length || 0;

  // Get recent tasks (last 5, ordered by createdAt descending)
  const recentTasks = tasks
    ? [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is a summary of your current tasks.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-primary">{totalTasks}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{pendingTasks}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">{completedTasks}</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Tasks List */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Failed to load tasks. Please try again later.</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No recent tasks to display.</p>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTaskDate(task.createdAt)}
                  </p>
                </div>
                <Badge
                  className={`${getStatusBadgeClasses(task.status)} border`}
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}