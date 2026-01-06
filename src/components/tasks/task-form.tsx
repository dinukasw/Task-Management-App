"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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

// Import your refined schema and type
import { taskSchema, type TaskInput } from "@/validators/task.schema";

interface TaskFormProps {
    onSuccess: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
    // 1. Explicitly type the useForm hook with <TaskInput>
    const form = useForm<TaskInput>({
        resolver: zodResolver(taskSchema),
        // 2. Ensure default values match the schema keys exactly
        defaultValues: {
            title: "",
            description: "",
            status: "PENDING" // This must match one of your enum values
        },
    });

    const isLoading = form.formState.isSubmitting;

    async function onSubmit(data: TaskInput) {
        try {
            console.log("Submitting Task:", data);
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                {/* Form Fields remain the same */}
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Task"}
                </Button>
            </form>
        </Form>
    );
}