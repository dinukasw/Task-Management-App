"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Import your refined schema and type
import { taskSchema, updateTaskSchema, type TaskInput, type UpdateTaskInput } from "@/validators/task.schema";

// Task type matching API response
interface Task {
    id: string;
    title: string;
    description: string | null;
    status: "PENDING" | "COMPLETED" | "CANCELED";
    userId: string;
    createdAt: string;
    updatedAt: string;
}

interface TaskFormProps {
    task?: Task;
    onSuccess: () => void;
}

interface TaskResponse {
    success: boolean;
    data: Task;
    error?: string;
}

// Create task API call
async function createTask(data: TaskInput): Promise<Task> {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result: TaskResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create task");
    }

    return result.data;
}

// Update task API call
async function updateTask(taskId: string, data: UpdateTaskInput): Promise<Task> {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result: TaskResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update task");
    }

    return result.data;
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

export function TaskForm({ task, onSuccess }: TaskFormProps) {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const isEditMode = !!task;

    // Use appropriate schema based on mode
    const form = useForm<TaskInput>({
        resolver: zodResolver(isEditMode ? updateTaskSchema : taskSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            status: task?.status || "PENDING",
        },
    });

    // Update form when task changes
    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || "",
                status: task.status,
            });
        }
    }, [task, form]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task created successfully");
            form.reset();
            onSuccess();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create task");
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
            updateTask(taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task updated successfully");
            onSuccess();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update task");
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task deleted successfully");
            setShowDeleteDialog(false);
            onSuccess();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete task");
        },
    });

    const isLoading = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

    async function onSubmit(data: TaskInput) {
        if (isEditMode && task) {
            updateMutation.mutate({
                taskId: task.id,
                data: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                },
            });
        } else {
            createMutation.mutate(data);
        }
    }

    function handleDelete() {
        if (task) {
            deleteMutation.mutate(task.id);
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel>Task Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter task title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Details..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => {
                            const isTerminalState = task && (task.status === "COMPLETED" || task.status === "CANCELED");
                            const isPendingState = task && task.status === "PENDING";
                            
                            return (
                                <FormItem className="mb-4">
                                    <FormLabel>Status</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                        disabled={isTerminalState || isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {!isPendingState && (
                                                <SelectItem value="PENDING">PENDING</SelectItem>
                                            )}
                                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                            <SelectItem value="CANCELED">CANCELED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isEditMode ? (
                                "Update Task"
                            ) : (
                                "Create Task"
                            )}
                        </Button>
                        {isEditMode && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={isLoading || deleteMutation.isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{task?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
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
        </>
    );
}