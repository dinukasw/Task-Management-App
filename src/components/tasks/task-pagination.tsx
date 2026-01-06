"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TaskPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TaskPagination({ currentPage, totalItems, itemsPerPage, onPageChange }: TaskPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate which page numbers to show
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    
    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Near the start: show 1, 2, 3, 4, ..., last
      pages.push(2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end: show 1, ..., last-3, last-2, last-1, last
      pages.push("ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push("ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't show pagination if there are no items or only one page
  if (totalItems === 0 || totalPages <= 1) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startIndex}-{endIndex}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span> tasks
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startIndex}-{endIndex}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> tasks
      </p>
      
      <Pagination className="justify-end w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePrevious}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-accent cursor-pointer"}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => handlePageClick(e, page)}
                  isActive={page === currentPage}
                  className={
                    page === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      : "hover:bg-accent cursor-pointer"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handleNext}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-accent cursor-pointer"}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}