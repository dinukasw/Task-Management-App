import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { RegisterInput, UpdateProfileInput, ChangePasswordInput } from "@/validators/auth.schema";

export interface UserWithoutPassword {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function registerUser(
  data: RegisterInput
): Promise<UserWithoutPassword> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserWithoutPassword> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<UserWithoutPassword> {
  // Check if email is being updated and if it's already taken
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("User with this email already exists");
    }
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateUserPassword(
  userId: string,
  data: ChangePasswordInput
): Promise<void> {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });
}

export async function deleteUser(userId: string): Promise<void> {
  // Delete user (tasks will be cascade deleted via Prisma)
  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function verifyUserPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
    },
  });

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
}

