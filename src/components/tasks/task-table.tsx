"use client";

import { useState, useMemo } from "react";
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

// Delete task API call
async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to delete task");
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
}

export function TaskTable({ searchQuery, sortOption, onSortChange, statusFilter }: TaskTableProps) {
  const queryClient = useQueryClient();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Fetch tasks
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    // Filter by search query (title only)
    let filtered = tasks;
    if (searchQuery.trim()) {
      filtered = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "date-newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "status-asc": {
          const statusOrder: Record<"PENDING" | "COMPLETED" | "CANCELED", number> = {
            PENDING: 0,
            COMPLETED: 1,
            CANCELED: 2,
          };
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          // Secondary sort by date (newest first) when status is the same
          return statusDiff !== 0
            ? statusDiff
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case "status-desc": {
          const statusOrder: Record<"PENDING" | "COMPLETED" | "CANCELED", number> = {
            PENDING: 2,
            COMPLETED: 1,
            CANCELED: 0,
          };
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          // Secondary sort by date (newest first) when status is the same
          return statusDiff !== 0
            ? statusDiff
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [tasks, searchQuery, sortOption, statusFilter]);

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

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
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

  if (filteredAndSortedTasks.length === 0) {
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
          {filteredAndSortedTasks.map((task) => (
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
