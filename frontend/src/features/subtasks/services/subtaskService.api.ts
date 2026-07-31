import { z } from 'zod';
import { apiClient } from '@/services/api/apiClient';
import {
  CreateSubtaskPayload,
  Subtask,
  subtaskSchema,
  UpdateSubtaskStatusPayload,
} from '../types/subtask';

export const apiSubtaskService = {
  async createSubtask(taskId: string, payload: CreateSubtaskPayload): Promise<Subtask> {
    const response = await apiClient.post(`/api/tasks/${taskId}/subtasks`, payload);
    return subtaskSchema.parse(response.data.data);
  },

  async listSubtasks(taskId: string): Promise<Subtask[]> {
    const response = await apiClient.get(`/api/tasks/${taskId}/subtasks`);
    return z.array(subtaskSchema).parse(response.data.data);
  },

  async toggleSubtaskStatus(subtaskId: string, payload: UpdateSubtaskStatusPayload): Promise<void> {
    await apiClient.patch(`/api/subtasks/${subtaskId}/status`, payload);
  },

  async deleteSubtask(subtaskId: string): Promise<void> {
    await apiClient.delete(`/api/subtasks/${subtaskId}`);
  },
};
