import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTaskFilters } from './useTaskFilters';
import { Task } from '../types/task';

const mockTasks: Task[] = [
  {
    id: 't-1',
    projectId: 'p-1',
    title: 'Setup Database Migration',
    description: 'Run 000006_create_subtasks_table.up.sql',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-08-15T00:00:00Z',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 't-2',
    projectId: 'p-1',
    title: 'Refactor UI Components',
    description: 'Use flat layout with selective borders',
    status: 'in_progress',
    priority: 'medium',
    assignee: { id: 'u-1', email: 'dev@test.com', username: 'dev', displayName: 'Dev User' },
    dueDate: '2026-08-10T00:00:00Z',
    createdAt: '2026-08-05T00:00:00Z',
  },
  {
    id: 't-3',
    projectId: 'p-1',
    title: 'Write Documentation',
    description: 'Update SPEC.md and DESIGN.md',
    status: 'done',
    priority: 'low',
    createdAt: '2026-08-07T00:00:00Z',
  },
];

describe('useTaskFilters', () => {
  it('returns all tasks by default sorted by due date ascending', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    expect(result.current.filteredTasks.length).toBe(3);
    // t-2 has earlier due date (Aug 10) than t-1 (Aug 15); t-3 has no due date (sorted last)
    expect(result.current.filteredTasks[0].id).toBe('t-2');
    expect(result.current.filteredTasks[1].id).toBe('t-1');
    expect(result.current.filteredTasks[2].id).toBe('t-3');
  });

  it('filters tasks by search query matching title or description', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));

    act(() => {
      result.current.setSearchQuery('Database');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('t-1');
  });

  it('filters tasks by priority filter', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));

    act(() => {
      result.current.setPriorityFilter('high');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('t-1');
  });

  it('filters tasks by assignee filter (unassigned vs specific)', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));

    // Unassigned
    act(() => {
      result.current.setAssigneeFilter('unassigned');
    });
    expect(result.current.filteredTasks.length).toBe(2);

    // Specific Assignee
    act(() => {
      result.current.setAssigneeFilter('u-1');
    });
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('t-2');
  });

  it('sorts tasks by priority descending', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));

    act(() => {
      result.current.setSortBy('priority_desc');
    });

    expect(result.current.filteredTasks[0].priority).toBe('high');
    expect(result.current.filteredTasks[1].priority).toBe('medium');
    expect(result.current.filteredTasks[2].priority).toBe('low');
  });
});
