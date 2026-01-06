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

export async function getTasks(userId: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
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
  // First verify the task exists and belongs to the user
  const existingTask = await prisma.task.findFirst({
    where: {
      id: id,
      userId: userId,
    },
  });

  if (!existingTask) {
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

  // Update the task
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
  // First verify the task exists and belongs to the user
  const existingTask = await prisma.task.findFirst({
    where: {
      id: id,
      userId: userId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  // Delete the task
  await prisma.task.delete({
    where: {
      id: id,
    },
  });
}

