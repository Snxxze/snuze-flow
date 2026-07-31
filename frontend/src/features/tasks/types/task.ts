import { z } from 'zod';

export const taskAssigneeSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
});

export const subtaskStatsSchema = z.object({
  totalCount: z.number(),
  completedCount: z.number(),
});

export const taskSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().nullable().optional(),
  assignee: taskAssigneeSchema.nullable().optional(),
  subtaskStats: subtaskStatsSchema.optional(),
  createdAt: z.string(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskAssignee = z.infer<typeof taskAssigneeSchema>;

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface UpdateTaskStatusPayload {
  status: 'todo' | 'in_progress' | 'done';
}
