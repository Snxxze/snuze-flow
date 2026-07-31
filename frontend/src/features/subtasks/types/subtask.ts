import { z } from 'zod';

export const subtaskSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  title: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.string(),
});

export type Subtask = z.infer<typeof subtaskSchema>;

export interface CreateSubtaskPayload {
  title: string;
}

export interface UpdateSubtaskStatusPayload {
  isCompleted: boolean;
}
