import { taskSchema, updateTaskSchema } from "../task.schema";

describe("Task Schemas", () => {
  describe("taskSchema", () => {
    it("should validate valid task data", () => {
      const validData = {
        title: "Complete project",
        description: "Finish the task management app",
        status: "PENDING" as const,
      };

      const result = taskSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate task without description", () => {
      const validData = {
        title: "Complete project",
        status: "PENDING" as const,
      };

      const result = taskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const invalidData = {
        title: "AB",
        description: "Test description",
        status: "PENDING" as const,
      };

      const result = taskSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("title");
      }
    });

    it("should reject missing title", () => {
      const invalidData = {
        description: "Test description",
        status: "PENDING" as const,
      };

      const result = taskSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        title: "Complete project",
        description: "Test description",
        status: "INVALID_STATUS" as any,
      };

      const result = taskSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept all valid statuses", () => {
      const statuses = ["PENDING", "COMPLETED", "CANCELED"] as const;

      statuses.forEach((status) => {
        const validData = {
          title: "Complete project",
          status,
        };

        const result = taskSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });
  });

  describe("updateTaskSchema", () => {
    it("should validate valid task update with all fields", () => {
      const validData = {
        title: "Updated title",
        description: "Updated description",
        status: "COMPLETED" as const,
      };

      const result = updateTaskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate task update with only title", () => {
      const validData = {
        title: "Updated title",
      };

      const result = updateTaskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate task update with only description", () => {
      const validData = {
        description: "Updated description",
      };

      const result = updateTaskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate task update with only status", () => {
      const validData = {
        status: "COMPLETED" as const,
      };

      const result = updateTaskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate empty object (all fields optional)", () => {
      const validData = {};

      const result = updateTaskSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const invalidData = {
        title: "AB",
      };

      const result = updateTaskSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("title");
      }
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "INVALID_STATUS" as any,
      };

      const result = updateTaskSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept all valid statuses", () => {
      const statuses = ["PENDING", "COMPLETED", "CANCELED"] as const;

      statuses.forEach((status) => {
        const validData = {
          status,
        };

        const result = updateTaskSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });
  });
});

