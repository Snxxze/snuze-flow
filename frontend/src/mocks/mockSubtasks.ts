import { Subtask } from '@/features/subtasks/types/subtask';

export const MOCK_SUBTASKS: Subtask[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    taskId: '10000000-0000-0000-0000-000000000001',
    title: 'Define Color Palette Tokens in Tailwind Config',
    isCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    taskId: '10000000-0000-0000-0000-000000000001',
    title: 'Build App Shell Sidebar with Collapse Toggle',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];
