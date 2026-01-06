"use client";

import { useState } from "react";
import { TaskHeader } from "@/components/tasks/task-header";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskPagination } from "@/components/tasks/task-pagination";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("date-newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  return (
    <div className="flex flex-col gap-6">
      <TaskHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <div className="flex flex-col gap-2">
        <TaskTable 
          searchQuery={searchQuery} 
          sortOption={sortOption} 
          onSortChange={setSortOption}
          statusFilter={statusFilter}
        />
        <TaskPagination />
      </div>
    </div>
  );
}