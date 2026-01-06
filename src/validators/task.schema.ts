import * as z from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]),
});

export type TaskInput = z.infer<typeof taskSchema>;

// This represents the data coming from your PostgreSQL database
export interface Task extends TaskInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}