"use client";

import { useState, useEffect } from "react";
import { TaskHeader } from "@/components/tasks/task-header";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskPagination } from "@/components/tasks/task-pagination";

const ITEMS_PER_PAGE = 10;

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("date-newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, statusFilter]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onTotalItemsChange={setTotalItems}
        />
        <TaskPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}