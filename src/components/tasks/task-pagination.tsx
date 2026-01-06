"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function TaskPagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">1-10</span> of{" "}
        <span className="font-medium text-foreground">45</span> tasks
      </p>
      
      <Pagination className="justify-end w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            {/* In a real app, you'd handle the 'disabled' state with CSS classes or pointers */}
            <PaginationPrevious href="#" className="hover:bg-accent" />
          </PaginationItem>
          
          <PaginationItem>
            <PaginationLink href="#" isActive className="bg-primary text-primary-foreground hover:bg-primary/90">
              1
            </PaginationLink>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationLink href="#" className="hover:bg-accent">
              2
            </PaginationLink>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          
          <PaginationItem>
            <PaginationNext href="#" className="hover:bg-accent" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}