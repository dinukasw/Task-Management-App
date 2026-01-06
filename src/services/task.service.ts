import { prisma } from "@/lib/prisma";
import type { TaskInput } from "@/validators/task.schema";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTask(
  userId: string,
  data: TaskInput
): Promise<Task> {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      userId: userId,
    },
  });

  return task;
}

export interface GetTasksOptions {
  page?: number;
  limit?: number;
  status?: "PENDING" | "COMPLETED" | "CANCELED";
  search?: string;
  sortBy?: "createdAt" | "status" | "title";
  sortOrder?: "asc" | "desc";
}

export interface GetTasksResult {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getTasks(
  userId: string,
  options: GetTasksOptions = {}
): Promise<GetTasksResult> {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build where clause
  const where: any = {
    userId: userId,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (sortBy === "status") {
    // For status sorting, we need a custom order
    // This will be handled by the application layer if needed
    orderBy.status = sortOrder;
    orderBy.createdAt = "desc"; // Secondary sort
  } else {
    orderBy[sortBy] = sortOrder;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count and tasks in parallel
  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  return {
    tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTaskById(
  id: string,
  userId: string
): Promise<Task> {
  const task = await prisma.task.findFirst({
    where: {
      id: id,
      userId: userId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

export async function updateTask(
  id: string,
  userId: string,
  data: Partial<TaskInput>
): Promise<Task> {
  // Optimized: Fetch task once to verify ownership and get current status
  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { status: true, userId: true },
  });

  if (!existingTask || existingTask.userId !== userId) {
    throw new Error("Task not found");
  }

  // Validate status transition rules if status is being updated
  if (data.status !== undefined && data.status !== existingTask.status) {
    // Terminal states cannot be changed
    if (existingTask.status === "COMPLETED" || existingTask.status === "CANCELED") {
      throw new Error("Cannot change status of completed or canceled task");
    }

    // PENDING tasks can only transition to COMPLETED or CANCELED
    if (existingTask.status === "PENDING") {
      if (data.status !== "COMPLETED" && data.status !== "CANCELED") {
        throw new Error("Pending tasks can only be changed to completed or canceled");
      }
    }
  }

  // Update the task (we know it exists and belongs to the user)
  const task = await prisma.task.update({
    where: {
      id: id,
    },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return task;
}

export async function deleteTask(
  id: string,
  userId: string
): Promise<void> {
  // Optimized: Verify ownership first, then delete
  // This ensures we only delete tasks that belong to the user
  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingTask || existingTask.userId !== userId) {
    throw new Error("Task not found");
  }

  // Delete the task (we know it exists and belongs to the user)
  await prisma.task.delete({
    where: {
      id: id,
    },
  });
}

