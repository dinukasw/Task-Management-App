/// <reference types="jest" />
import type { PrismaClient } from "@/generated/prisma/client";

export function createMockPrismaClient(): Partial<PrismaClient> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPrisma: any = {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        task: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    return mockPrisma as unknown as Partial<PrismaClient>;
}

export type MockPrismaClient = ReturnType<typeof createMockPrismaClient>;
