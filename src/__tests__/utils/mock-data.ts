import type { UserWithoutPassword } from "@/services/auth.service";
import type { Task } from "@/services/task.service";

export const mockUser: UserWithoutPassword = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
};

export const mockUserWithPassword = {
    ...mockUser,
    password: "$2a$10$hashedpasswordexample",
};

export const mockTask: Task = {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    status: "PENDING",
    userId: "user-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
};

export const mockTasks: Task[] = [
    mockTask,
    {
        ...mockTask,
        id: "task-2",
        title: "Another Task",
        status: "COMPLETED",
    },
    {
        ...mockTask,
        id: "task-3",
        title: "Third Task",
        status: "CANCELED",
    },
];

export const mockRegisterInput = {
    name: "New User",
    email: "newuser@example.com",
    password: "password123",
};

export const mockLoginInput = {
    email: "test@example.com",
    password: "password123",
};

export const mockTaskInput = {
    title: "New Task",
    description: "Task Description",
    status: "PENDING" as const,
};
