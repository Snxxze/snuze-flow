import { useState, useCallback } from 'react';
import { subtaskService } from '../services/subtaskService';
import { Subtask } from '../types/subtask';

export function useInlineSubtasks() {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [subtasksMap, setSubtasksMap] = useState<Record<string, Subtask[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});

  const fetchSubtasks = useCallback(async (taskId: string) => {
    setLoadingTasks((prev) => ({ ...prev, [taskId]: true }));
    try {
      const data = await subtaskService.listSubtasks(taskId);
      setSubtasksMap((prev) => ({ ...prev, [taskId]: data }));
    } catch (err) {
      console.error(`Failed to fetch subtasks for task ${taskId}:`, err);
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  }, []);

  const toggleTaskExpanded = useCallback(
    (taskId: string) => {
      setExpandedTasks((prev) => {
        const isExpanding = !prev[taskId];
        if (isExpanding && !subtasksMap[taskId]) {
          fetchSubtasks(taskId);
        }
        return { ...prev, [taskId]: isExpanding };
      });
    },
    [subtasksMap, fetchSubtasks]
  );

  const toggleSubtaskStatus = useCallback(
    async (taskId: string, subtaskId: string, currentCompleted: boolean, onUpdated?: () => void) => {
      // Optimistic update
      setSubtasksMap((prev) => {
        const list = prev[taskId] || [];
        return {
          ...prev,
          [taskId]: list.map((s) => (s.id === subtaskId ? { ...s, isCompleted: !currentCompleted } : s)),
        };
      });

      try {
        await subtaskService.toggleSubtaskStatus(subtaskId, { isCompleted: !currentCompleted });
        if (onUpdated) onUpdated();
      } catch (err) {
        console.error(`Failed to toggle subtask ${subtaskId}:`, err);
        // Revert on error
        fetchSubtasks(taskId);
      }
    },
    [fetchSubtasks]
  );

  const createSubtask = useCallback(
    async (taskId: string, title: string, onUpdated?: () => void) => {
      if (!title.trim()) return;
      try {
        await subtaskService.createSubtask(taskId, { title });
        await fetchSubtasks(taskId);
        if (onUpdated) onUpdated();
      } catch (err) {
        console.error(`Failed to create subtask for task ${taskId}:`, err);
      }
    },
    [fetchSubtasks]
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string, onUpdated?: () => void) => {
      // Optimistic delete
      setSubtasksMap((prev) => {
        const list = prev[taskId] || [];
        return {
          ...prev,
          [taskId]: list.filter((s) => s.id !== subtaskId),
        };
      });

      try {
        await subtaskService.deleteSubtask(subtaskId);
        if (onUpdated) onUpdated();
      } catch (err) {
        console.error(`Failed to delete subtask ${subtaskId}:`, err);
        fetchSubtasks(taskId);
      }
    },
    [fetchSubtasks]
  );

  return {
    expandedTasks,
    subtasksMap,
    loadingTasks,
    toggleTaskExpanded,
    toggleSubtaskStatus,
    createSubtask,
    deleteSubtask,
    refetchSubtasks: fetchSubtasks,
  };
}
