import { useState } from 'react';

export type ViewMode = 'board' | 'list';

export function useTaskViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
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
