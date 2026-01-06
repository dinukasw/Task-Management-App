"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TaskHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left Side: Title and Description */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Manage and track your daily activities.
        </p>
      </div>

      {/* Right Side: Search and Action Button */}
      <div className="flex flex-1  items-center justify-between gap-3 sm:flex-initial">
        <div className="relative  flex w-72 items-center sm:w-72">
          <Search 
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" 
          />
          <Input 
            type="search"
            placeholder="Search tasks..." 
            className="h-10 pl-10 pr-4 focus-visible:ring-primary/50" 
          />
        </div>

        <Button className="h-10 bg-primary font-semibold hover:bg-primary/90 shadow-sm transition-all active:scale-95">
          <Plus className="mr-2 size-4" /> 
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </div>
  );
}