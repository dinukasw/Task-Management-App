"use client";

import { MoreHorizontal, Calendar } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for UI visualization
const MOCK_TASKS = [
  { id: "1", title: "Setup Prisma Schema", status: "COMPLETED", createdAt: "2026-01-01" },
  { id: "2", title: "Implement Auth API", status: "PENDING", createdAt: "2026-01-05" },
];

export function TaskTable() {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_TASKS.map((task) => (
            <TableRow key={task.id} className="group transition-colors hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className={task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={task.status === "COMPLETED" ? "secondary" : "default"} className="font-semibold">
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {task.createdAt}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}