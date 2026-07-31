import { z } from 'zod';
import { apiClient } from '@/services/api/apiClient';
import {
  CreateTaskPayload,
  Task,
  taskSchema,
  UpdateTaskStatusPayload,
} from '../types/task';

export const apiTaskService = {
  async createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    const response = await apiClient.post(`/api/projects/${projectId}/tasks`, payload);
    return taskSchema.parse(response.data.data);
  },

  async listTasks(projectId: string): Promise<Task[]> {
    const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
    return z.array(taskSchema).parse(response.data.data);
  },

  async updateTaskStatus(taskId: string, payload: UpdateTaskStatusPayload): Promise<void> {
    await apiClient.patch(`/api/tasks/${taskId}/status`, payload);
  },

  async updateTask(taskId: string, payload: Partial<CreateTaskPayload>): Promise<Task> {
    const response = await apiClient.patch(`/api/tasks/${taskId}`, payload);
    return taskSchema.parse(response.data.data);
  },

  async getDashboardTasks(): Promise<Task[]> {
    const response = await apiClient.get('/api/dashboard');
    return z.array(taskSchema).parse(response.data.data);
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${taskId}`);
  },
};
