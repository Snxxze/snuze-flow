import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanBoard } from './KanbanBoard';
import { Task } from '@/features/tasks/types/task';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1 in Todo',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    projectId: 'proj-1',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Task 2 in Progress',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    projectId: 'proj-1',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('KanbanBoard Drag and Drop', () => {
  it('calls onStatusChange when dragging a task to a different column', async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);
    const handleDeleteTask = vi.fn().mockResolvedValue(undefined);

    render(
      <KanbanBoard
        tasks={mockTasks}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        viewMode="board"
      />
    );

    const taskCard = screen.getByText('Task 1 in Todo').closest('[draggable="true"]');
    expect(taskCard).not.toBeNull();

    const dataStore: Record<string, string> = {};
    const dataTransfer = {
      setData: (key: string, val: string) => {
        dataStore[key] = val;
      },
      getData: (key: string) => dataStore[key] || '',
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    fireEvent.dragStart(taskCard!, { dataTransfer });

    const inProgressHeaders = screen.getAllByText('project.stat_in_progress');
    const inProgressColumn = inProgressHeaders[0].closest('div.flex-col');
    expect(inProgressColumn).not.toBeNull();

    fireEvent.dragOver(inProgressColumn!, { dataTransfer });
    fireEvent.drop(inProgressColumn!, { dataTransfer });

    expect(handleStatusChange).toHaveBeenCalledTimes(1);
    expect(handleStatusChange).toHaveBeenCalledWith('task-1', 'in_progress');
  });

  it('does NOT call onStatusChange when dropping a task into its current column (same-column no-op)', async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);
    const handleDeleteTask = vi.fn().mockResolvedValue(undefined);

    render(
      <KanbanBoard
        tasks={mockTasks}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        viewMode="board"
      />
    );

    const taskCard = screen.getByText('Task 1 in Todo').closest('[draggable="true"]');
    const todoHeaders = screen.getAllByText('project.stat_todo');
    const todoColumn = todoHeaders[0].closest('div.flex-col');

    const dataStore: Record<string, string> = {};
    const dataTransfer = {
      setData: (key: string, val: string) => {
        dataStore[key] = val;
      },
      getData: (key: string) => dataStore[key] || '',
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    fireEvent.dragStart(taskCard!, { dataTransfer });
    fireEvent.drop(todoColumn!, { dataTransfer });

    expect(handleStatusChange).not.toHaveBeenCalled();
  });
});
