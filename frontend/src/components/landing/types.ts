// Types local to the Landing page Sandbox — separate from the real Task feature types
// เพื่อ avoid coupling หน้า Landing กับ API contract จริง

export type SandboxTaskStatus = 'todo' | 'in_progress' | 'done';
export type SandboxTaskPriority = 'high' | 'medium' | 'low';
export type SandboxDueStatus = 'overdue' | 'warning' | 'normal' | 'done';

export interface SandboxSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface SandboxTask {
  id: string;
  title: string;
  status: SandboxTaskStatus;
  priority: SandboxTaskPriority;
  dueLabel: string;
  dueStatus: SandboxDueStatus;
  subtasks: SandboxSubtask[];
  assigneeInitials: string;
  assigneeColor: string;
}

export const SANDBOX_STATUS_ORDER: SandboxTaskStatus[] = ['todo', 'in_progress', 'done'];
