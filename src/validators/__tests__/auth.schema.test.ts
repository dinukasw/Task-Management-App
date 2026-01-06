import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../auth.schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("email");
      }
    });

    it("should reject password shorter than 6 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("password");
      }
    });

    it("should reject missing email", () => {
      const invalidData = {
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const invalidData = {
        email: "test@example.com",
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate valid register data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "J",
        email: "john@example.com",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("name");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 6 characters", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "12345",
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("should validate valid profile update with name", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate valid profile update with email", () => {
      const validData = {
        email: "newemail@example.com",
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should validate valid profile update with both fields", () => {
      const validData = {
        name: "Updated Name",
        email: "newemail@example.com",
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject when both fields are undefined", () => {
      const invalidData = {};

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("At least one field");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "J",
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("should validate valid password change data", () => {
      const validData = {
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "differentpassword",
      };

      const result = changePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("confirmPassword");
      }
    });

    it("should reject new password shorter than 6 characters", () => {
      const invalidData = {
        currentPassword: "oldpassword123",
        newPassword: "12345",
        confirmPassword: "12345",
      };

      const result = changePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject missing current password", () => {
      const invalidData = {
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("deleteAccountSchema", () => {
    it("should validate valid delete account data", () => {
      const validData = {
        password: "password123",
      };

      const result = deleteAccountSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject missing password", () => {
      const invalidData = {};

      const result = deleteAccountSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        password: "",
      };

      const result = deleteAccountSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

