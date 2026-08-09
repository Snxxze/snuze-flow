import { useState } from 'react';

export type ViewMode = 'board' | 'list' | 'table';

const STORAGE_KEY = 'snuzeflow_task_view_mode';

export function useTaskViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'board' || saved === 'list' || saved === 'table') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'board';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage errors
    }
  };

  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const isColumnCollapsed = (columnId: string) => collapsedColumns.has(columnId);

  return {
    viewMode,
    setViewMode,
    collapsedColumns,
    toggleColumnCollapse,
    isColumnCollapsed,
  };
}
