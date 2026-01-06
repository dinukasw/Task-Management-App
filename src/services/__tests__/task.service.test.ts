import { prisma } from "@/lib/prisma";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../task.service";
import { mockTask, mockTasks, mockTaskInput } from "@/__tests__/utils/mock-data";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Task Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await createTask("user-1", mockTaskInput);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: mockTaskInput.title,
          description: mockTaskInput.description,
          status: mockTaskInput.status,
          userId: "user-1",
        },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe("getTasks", () => {
    it("should get tasks with default pagination", async () => {
      (prisma.task.count as jest.Mock).mockResolvedValue(3);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasks("user-1");

      expect(prisma.task.count).toHaveBeenCalled();
      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(result.tasks).toEqual(mockTasks);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should filter tasks by status", async () => {
      (prisma.task.count as jest.Mock).mockResolvedValue(1);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTasks[0]]);

      const result = await getTasks("user-1", { status: "PENDING" });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PENDING",
          }),
        })
      );
      expect(result.tasks).toHaveLength(1);
    });

    it("should search tasks by title", async () => {
      (prisma.task.count as jest.Mock).mockResolvedValue(1);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTasks[0]]);

      const result = await getTasks("user-1", { search: "Test" });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.objectContaining({
              contains: "Test",
              mode: "insensitive",
            }),
          }),
        })
      );
    });

    it("should paginate tasks correctly", async () => {
      (prisma.task.count as jest.Mock).mockResolvedValue(20);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks.slice(0, 5));

      const result = await getTasks("user-1", { page: 2, limit: 5 });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(4);
    });

    it("should sort tasks correctly", async () => {
      (prisma.task.count as jest.Mock).mockResolvedValue(3);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      await getTasks("user-1", { sortBy: "title", sortOrder: "asc" });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            title: "asc",
          },
        })
      );
    });
  });

  describe("getTaskById", () => {
    it("should return task if found", async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      const result = await getTaskById("task-1", "user-1");

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: {
          id: "task-1",
          userId: "user-1",
        },
      });
      expect(result).toEqual(mockTask);
    });

    it("should throw error if task not found", async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getTaskById("nonexistent-id", "user-1")).rejects.toThrow("Task not found");
    });
  });

  describe("updateTask", () => {
    it("should update task successfully", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: "PENDING",
        userId: "user-1",
      });
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        title: "Updated Title",
      });

      const result = await updateTask("task-1", "user-1", { title: "Updated Title" });

      expect(prisma.task.update).toHaveBeenCalled();
      expect(result.title).toBe("Updated Title");
    });

    it("should throw error if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(updateTask("nonexistent-id", "user-1", { title: "New Title" })).rejects.toThrow(
        "Task not found"
      );
    });

    it("should throw error if task belongs to different user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: "PENDING",
        userId: "other-user",
      });

      await expect(updateTask("task-1", "user-1", { title: "New Title" })).rejects.toThrow(
        "Task not found"
      );
    });

    it("should throw error when trying to change completed task status", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: "COMPLETED",
        userId: "user-1",
      });

      await expect(
        updateTask("task-1", "user-1", { status: "PENDING" })
      ).rejects.toThrow("Cannot change status of completed or canceled task");
    });

    it("should throw error when trying to change canceled task status", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: "CANCELED",
        userId: "user-1",
      });

      await expect(
        updateTask("task-1", "user-1", { status: "PENDING" })
      ).rejects.toThrow("Cannot change status of completed or canceled task");
    });

    it("should allow valid status transition from PENDING to COMPLETED", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: "PENDING",
        userId: "user-1",
      });
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        status: "COMPLETED",
      });

      const result = await updateTask("task-1", "user-1", { status: "COMPLETED" });

      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("deleteTask", () => {
    it("should delete task successfully", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        userId: "user-1",
      });
      (prisma.task.delete as jest.Mock).mockResolvedValue({});

      await deleteTask("task-1", "user-1");

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" },
      });
    });

    it("should throw error if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteTask("nonexistent-id", "user-1")).rejects.toThrow("Task not found");
    });

    it("should throw error if task belongs to different user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        userId: "other-user",
      });

      await expect(deleteTask("task-1", "user-1")).rejects.toThrow("Task not found");
    });
  });
});

