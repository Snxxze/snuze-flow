import { useMemo, useState } from 'react';
import { Task } from '../types/task';

export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type SortOption = 'due_date_asc' | 'priority_desc' | 'created_at_desc';

export function useTaskFilters(tasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('due_date_asc');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Search Query Check
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Priority Check
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      // 3. Assignee Check
      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !t.assignee) ||
        (t.assignee && t.assignee.id === assigneeFilter);

      return matchesSearch && matchesPriority && matchesAssignee;
    }).sort((a, b) => {
      if (sortBy === 'due_date_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority_desc') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'created_at_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    sortBy,
    setSortBy,
    filteredTasks,
  };
}
