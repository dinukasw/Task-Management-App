import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateUserPassword,
  deleteUser,
  verifyUserPassword,
} from "../auth.service";
import { mockUser, mockUserWithPassword, mockRegisterInput } from "@/__tests__/utils/mock-data";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await registerUser(mockRegisterInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterInput.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterInput.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(registerUser(mockRegisterInput)).rejects.toThrow(
        "User with this email already exists"
      );
    });
  });

  describe("loginUser", () => {
    it("should login user with valid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await loginUser(mockRegisterInput.email, mockRegisterInput.password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterInput.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockRegisterInput.password,
        mockUserWithPassword.password
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(loginUser("nonexistent@example.com", "password")).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should throw error if password is invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUser(mockRegisterInput.email, "wrongpassword")).rejects.toThrow(
        "Invalid email or password"
      );
    });
  });

  describe("getUserById", () => {
    it("should return user if found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById("user-1");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user if found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByEmail("test@example.com");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: "Updated Name",
      });

      const result = await updateUserProfile("user-1", { name: "Updated Name" });

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.name).toBe("Updated Name");
    });

    it("should throw error if email is already taken", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: "other-user-id",
      });

      await expect(
        updateUserProfile("user-1", { email: "test@example.com" })
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("updateUserPassword", () => {
    it("should update password successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        password: "oldHashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await updateUserPassword("user-1", {
        currentPassword: "oldPassword",
        newPassword: "newPassword",
        confirmPassword: "newPassword",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("oldPassword", "oldHashedPassword");
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updateUserPassword("nonexistent-id", {
          currentPassword: "oldPassword",
          newPassword: "newPassword",
          confirmPassword: "newPassword",
        })
      ).rejects.toThrow("User not found");
    });

    it("should throw error if current password is incorrect", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        password: "oldHashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        updateUserPassword("user-1", {
          currentPassword: "wrongPassword",
          newPassword: "newPassword",
          confirmPassword: "newPassword",
        })
      ).rejects.toThrow("Current password is incorrect");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      await deleteUser("user-1");

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
    });
  });

  describe("verifyUserPassword", () => {
    it("should return true if password is correct", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyUserPassword("user-1", "password");

      expect(result).toBe(true);
    });

    it("should return false if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await verifyUserPassword("nonexistent-id", "password");

      expect(result).toBe(false);
    });

    it("should return false if password is incorrect", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyUserPassword("user-1", "wrongPassword");

      expect(result).toBe(false);
    });
  });
});

