"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Calendar, Loader2, Pencil, Trash2, ChevronDown } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTaskDate } from "@/lib/date";
import { toast } from "sonner";
import { TaskForm } from "./task-form";
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
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

interface TaskUpdateResponse {
  success: boolean;
  data: Task;
  error?: string;
}

interface FetchTasksParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Fetch tasks from API with server-side filtering, sorting, and pagination
async function fetchTasks(params: FetchTasksParams = {}): Promise<{ tasks: Task[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const { page = 1, limit = 10, status, search, sortBy, sortOrder } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("page", page.toString());
    queryParams.set("limit", limit.toString());
    if (status && status !== "all") queryParams.set("status", status);
    if (search) queryParams.set("search", search);
    if (sortBy) {
      queryParams.set("sortBy", sortBy);
      queryParams.set("sortOrder", sortOrder || "desc");
    }

    const response = await fetch(`/api/tasks?${queryParams.toString()}`);

    // Handle network errors
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch tasks (${response.status})`);
      } catch {
        // If JSON parsing fails, throw network error
        throw new Error(`Network error: ${response.statusText || "Unable to connect to server"}`);
      }
    }

    const data: TaskResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch tasks");
    }

    return {
      tasks: data.data,
      pagination: data.pagination || { total: data.data.length, page: 1, limit: data.data.length, totalPages: 1 },
    };
  } catch (error) {
    // Re-throw with enhanced error message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while fetching tasks");
  }
}

// Update task status
async function updateTaskStatus(taskId: string, status: "PENDING" | "COMPLETED" | "CANCELED"): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    // Handle network errors
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update task status (${response.status})`);
      } catch {
        throw new Error(`Network error: ${response.statusText || "Unable to connect to server"}`);
      }
    }

    const data: TaskUpdateResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to update task status");
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while updating task status");
  }
}

// Delete task API call
async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    // Handle network errors
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete task (${response.status})`);
      } catch {
        throw new Error(`Network error: ${response.statusText || "Unable to connect to server"}`);
      }
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to delete task");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while deleting task");
  }
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

interface TaskTableProps {
  searchQuery: string;
  sortOption: string;
  onSortChange: (option: string) => void;
  statusFilter: string;
  currentPage: number;
  itemsPerPage: number;
  onTotalItemsChange: (total: number) => void;
}

export function TaskTable({ searchQuery, sortOption, onSortChange, statusFilter, currentPage, itemsPerPage, onTotalItemsChange }: TaskTableProps) {
  const queryClient = useQueryClient();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Map sortOption to API parameters
  const getSortParams = () => {
    switch (sortOption) {
      case "date-newest":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "date-oldest":
        return { sortBy: "createdAt", sortOrder: "asc" };
      case "status-asc":
        return { sortBy: "status", sortOrder: "asc" };
      case "status-desc":
        return { sortBy: "status", sortOrder: "desc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  const sortParams = getSortParams();

  // Fetch tasks with server-side filtering, sorting, and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption],
    queryFn: () => fetchTasks({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery.trim() || undefined,
      ...sortParams,
    }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to load tasks. Please try again.");
    },
  });

  const tasks = data?.tasks || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: itemsPerPage, totalPages: 1 };

  // Notify parent of total items change
  useEffect(() => {
    onTotalItemsChange(pagination.total);
  }, [pagination.total, onTotalItemsChange]);

  // Update task status mutation with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: "PENDING" | "COMPLETED" | "CANCELED" }) =>
      updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<{ tasks: Task[]; pagination: any }>(["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption]);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<{ tasks: Task[]; pagination: any }>(
          ["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption],
          {
            ...previousData,
            tasks: previousData.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task
            ),
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption],
          context.previousData
        );
      }

      // Provide more specific error messages
      if (error.message.includes("Network error")) {
        toast.error("Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes("Cannot change status")) {
        toast.error(error.message);
      } else if (error.message.includes("Invalid or expired token")) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error(error.message || "Failed to update task status. Please try again.");
      }
    },
    onSuccess: (_, variables) => {
      const statusText = variables.status.charAt(0) + variables.status.slice(1).toLowerCase();
      toast.success(`Task marked as ${statusText} successfully`);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<{ tasks: Task[]; pagination: any }>(["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption]);

      // Optimistically remove the task
      if (previousData) {
        queryClient.setQueryData<{ tasks: Task[]; pagination: any }>(
          ["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption],
          {
            ...previousData,
            tasks: previousData.tasks.filter((task) => task.id !== taskId),
            pagination: {
              ...previousData.pagination,
              total: Math.max(0, previousData.pagination.total - 1),
            },
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: Error, _taskId, context) => {
      // Rollback to the previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["tasks", currentPage, itemsPerPage, statusFilter, searchQuery, sortOption],
          context.previousData
        );
      }

      // Provide more specific error messages
      if (error.message.includes("Network error")) {
        toast.error("Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes("Task not found")) {
        toast.error("Task not found. It may have already been deleted.");
      } else if (error.message.includes("Invalid or expired token")) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error(error.message || "Failed to delete task. Please try again.");
      }
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleStatusChange = (taskId: string, status: "PENDING" | "COMPLETED" | "CANCELED") => {
    updateStatusMutation.mutate({ taskId, status });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete.id);
    }
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setSelectedTask(null);
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

  if (!isLoading && (!tasks || tasks.length === 0)) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border transition-colors">
              <TableHead className="w-[50%] h-12 font-semibold text-sm text-foreground">
                Task
              </TableHead>
              <TableHead className="h-12 font-semibold text-sm text-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent"
                    >
                      Status
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onSortChange("status-asc")}
                      className={sortOption === "status-asc" ? "bg-accent" : ""}
                    >
                      PENDING → COMPLETED → CANCELED
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSortChange("status-desc")}
                      className={sortOption === "status-desc" ? "bg-accent" : ""}
                    >
                      CANCELED → COMPLETED → PENDING
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

  if (!isLoading && tasks.length === 0 && (searchQuery.trim() || statusFilter !== "all")) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border transition-colors">
              <TableHead className="w-[50%] h-12 font-semibold text-sm text-foreground">
                Task
              </TableHead>
              <TableHead className="h-12 font-semibold text-sm text-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent"
                    >
                      Status
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onSortChange("status-asc")}
                      className={sortOption === "status-asc" ? "bg-accent" : ""}
                    >
                      PENDING → COMPLETED → CANCELED
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSortChange("status-desc")}
                      className={sortOption === "status-desc" ? "bg-accent" : ""}
                    >
                      CANCELED → COMPLETED → PENDING
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim()
                      ? `No tasks found matching "${searchQuery}".`
                      : "No tasks found. Create your first task to get started!"}
                  </p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent"
                  >
                    Status
                    <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Sort by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onSortChange("status-asc")}
                    className={sortOption === "status-asc" ? "bg-accent" : ""}
                  >
                    PENDING → COMPLETED → CANCELED
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSortChange("status-desc")}
                    className={sortOption === "status-desc" ? "bg-accent" : ""}
                  >
                    CANCELED → COMPLETED → PENDING
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                          disabled={
                            task.status === "PENDING" ||
                            task.status === "COMPLETED" ||
                            task.status === "CANCELED" ||
                            updateStatusMutation.isPending
                          }
                        >
                          PENDING
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "COMPLETED")}
                          disabled={
                            task.status === "COMPLETED" ||
                            task.status === "CANCELED" ||
                            updateStatusMutation.isPending
                          }
                        >
                          COMPLETED
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "CANCELED")}
                          disabled={
                            task.status === "CANCELED" ||
                            task.status === "COMPLETED" ||
                            updateStatusMutation.isPending
                          }
                        >
                          CANCELED
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(task)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white bg-red-500 dark:bg-red-500 hover:bg-red-500/20 dark:hover:bg-red-500/30 focus:bg-red-500/80 dark:focus:bg-red-500/80"
                      onClick={() => handleDeleteClick(task)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-md sm:max-w-lg px-6 py-8 sm:px-8 sm:py-10"
        >
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
            <SheetDescription>
              Update the task details below.
            </SheetDescription>
          </SheetHeader>
          {selectedTask && (
            <TaskForm task={selectedTask} onSuccess={handleEditSuccess} />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:text-white dark:hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
