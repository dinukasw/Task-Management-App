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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TaskForm } from "./task-form";

interface TaskHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortOption: string;
    onSortChange: (option: string) => void;
    statusFilter: string;
    onStatusFilterChange: (filter: string) => void;
}

export function TaskHeader({ searchQuery, onSearchChange, sortOption, onSortChange, statusFilter, onStatusFilterChange }: TaskHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Top Layer: Title and New Task Button */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage and track your daily activities.</p>
                </div>

                {/* New Task Button */}
                <div className="flex sm:justify-end sm:items-start  sm:w-[140px]">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button className="h-10 bg-primary font-semibold hover:bg-primary/90 w-full">
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

            {/* Bottom Layer: Search Bar, Sort, and Status Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative flex-1 w-full sm:flex-initial">
                    <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 pl-10 pr-3 w-full sm:min-w-[280px] sm:max-w-sm"
                    />
                </div>

                <div className="w-full sm:w-[140px]">
                    <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-full h-10 bg-background">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date-newest">Newest First</SelectItem>
                            <SelectItem value="date-oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-[140px]">
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="w-full h-10 bg-background">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent >
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}