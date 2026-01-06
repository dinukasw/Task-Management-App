"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Calendar, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTaskDate } from "@/lib/date";
import { toast } from "sonner";
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

interface TaskUpdateResponse {
  success: boolean;
  data: Task;
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

// Update task status
async function updateTaskStatus(taskId: string, status: "PENDING" | "COMPLETED" | "CANCELED"): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data: TaskUpdateResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to update task status");
  }

  return data.data;
}

// Get status badge color classes
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

export function TaskTable() {
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: "PENDING" | "COMPLETED" | "CANCELED" }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task status");
    },
  });

  const handleStatusChange = (taskId: string, status: "PENDING" | "COMPLETED" | "CANCELED") => {
    updateStatusMutation.mutate({ taskId, status });
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load tasks"}
          </p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border transition-colors">
              <TableHead className="w-[50%] h-12 font-semibold text-sm text-foreground">
                Task
              </TableHead>
              <TableHead className="h-12 font-semibold text-sm text-foreground">
                Status
              </TableHead>
              <TableHead className="h-12 font-semibold text-sm text-foreground">
                Created
              </TableHead>
              <TableHead className="text-right h-12 font-semibold text-sm text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="h-32">
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No tasks found. Create your first task to get started!</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b border-border transition-colors">
            <TableHead className="w-[50%] h-12 font-semibold text-sm text-foreground">
              Task
            </TableHead>
            <TableHead className="h-12 font-semibold text-sm text-foreground">
              Status
            </TableHead>
            <TableHead className="h-12 font-semibold text-sm text-foreground">
              Created
            </TableHead>
            <TableHead className="text-right h-12 font-semibold text-sm text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="group transition-colors border-b border-border/50 last:border-b-0"
            >
              <TableCell className="font-medium py-4">
                <div className="flex flex-col gap-1.5">
                  <span className={task.status === "COMPLETED" ? "line-through text-muted-foreground" : "text-foreground"}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-xs text-muted-foreground line-clamp-2 truncate leading-relaxed">
                      {task.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge
                  className={`font-semibold border ${getStatusBadgeClasses(task.status)}`}
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground py-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatTaskDate(task.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "PENDING")}
                          disabled={task.status === "PENDING" || updateStatusMutation.isPending}
                        >
                          PENDING
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "COMPLETED")}
                          disabled={task.status === "COMPLETED" || updateStatusMutation.isPending}
                        >
                          COMPLETED
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "CANCELED")}
                          disabled={task.status === "CANCELED" || updateStatusMutation.isPending}
                        >
                          CANCELED
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
