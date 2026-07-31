import { MOCK_SUBTASKS } from '@/mocks';
import { CreateSubtaskPayload, Subtask, UpdateSubtaskStatusPayload } from '../types/subtask';

export const mockSubtaskService = {
  async createSubtask(taskId: string, payload: CreateSubtaskPayload): Promise<Subtask> {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      taskId,
      title: payload.title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    MOCK_SUBTASKS.push(newSubtask);
    return newSubtask;
  },

  async listSubtasks(taskId: string): Promise<Subtask[]> {
    return MOCK_SUBTASKS.filter((s) => s.taskId === taskId);
  },

  async toggleSubtaskStatus(subtaskId: string, payload: UpdateSubtaskStatusPayload): Promise<void> {
    const subtask = MOCK_SUBTASKS.find((s) => s.id === subtaskId);
    if (subtask) subtask.isCompleted = payload.isCompleted;
  },

  async deleteSubtask(subtaskId: string): Promise<void> {
    const idx = MOCK_SUBTASKS.findIndex((s) => s.id === subtaskId);
    if (idx !== -1) MOCK_SUBTASKS.splice(idx, 1);
  },
};
