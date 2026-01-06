"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { TaskForm } from "./task-form";

export function TaskHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h1>
                <p className="text-sm text-muted-foreground font-medium">Manage and track your daily activities.</p>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3 sm:flex-initial">
            <div className="relative flex  w-full max-w-xs sm:max-w-sm items-center sm:w-72">
 
                    <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="search" placeholder="Search tasks..." className="h-10 pl-10" />
                </div>

                {/* --- SHEET IMPLEMENTATION --- */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button className="h-10 bg-primary font-semibold hover:bg-primary/90">
                            <Plus className="mr-2 size-4" />
                            <span className="hidden sm:inline">New Task</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-full max-w-md sm:max-w-lg px-6 py-8 sm:px-8 sm:py-10"
                    >
                        <SheetHeader>
                            <SheetTitle>Create New Task</SheetTitle>
                            <SheetDescription>
                                Fill in the details below to add a new task to your list.
                            </SheetDescription>
                        </SheetHeader>
                        <TaskForm onSuccess={() => setIsOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}