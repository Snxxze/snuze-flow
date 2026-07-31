import { MOCK_TASKS } from '@/mocks';
import { CreateTaskPayload, Task, UpdateTaskStatusPayload } from '../types/task';

export const mockTaskService = {
  async createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    const newTask: Task = {
      id: crypto.randomUUID(),
      projectId,
      title: payload.title,
      description: payload.description,
      status: 'todo',
      priority: payload.priority,
      dueDate: payload.dueDate || null,
      createdAt: new Date().toISOString(),
    };
    MOCK_TASKS.push(newTask);
    return newTask;
  },

  async listTasks(projectId: string): Promise<Task[]> {
    return MOCK_TASKS.filter((t) => t.projectId === projectId);
  },

  async updateTaskStatus(taskId: string, payload: UpdateTaskStatusPayload): Promise<void> {
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (task) task.status = payload.status;
  },

  async updateTask(taskId: string, payload: Partial<CreateTaskPayload>): Promise<Task> {
    const task = MOCK_TASKS.find((t) => t.id === taskId) || MOCK_TASKS[0];
    if (payload.title) task.title = payload.title;
    if (payload.description) task.description = payload.description;
    if (payload.priority) task.priority = payload.priority;
    if (payload.dueDate) task.dueDate = payload.dueDate;
    return task;
  },

  async getDashboardTasks(): Promise<Task[]> {
    return MOCK_TASKS;
  },

  async deleteTask(taskId: string): Promise<void> {
    const idx = MOCK_TASKS.findIndex((t) => t.id === taskId);
    if (idx !== -1) MOCK_TASKS.splice(idx, 1);
  },
};
