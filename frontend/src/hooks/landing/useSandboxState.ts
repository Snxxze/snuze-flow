import { useCallback, useState } from 'react';
import { MOCK_LANDING_TASKS } from '@/mocks/mockLandingTasks';
import { SandboxTask, SandboxTaskStatus, SANDBOX_STATUS_ORDER } from '@/components/landing/types';

export function useSandboxState() {
  const [tasks, setTasks] = useState<SandboxTask[]>(MOCK_LANDING_TASKS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTo, setAddingTo] = useState<SandboxTaskStatus | null>(null);

  const moveTask = useCallback((id: string, direction: 'left' | 'right') => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = SANDBOX_STATUS_ORDER.indexOf(t.status);
        const nextIdx = direction === 'right' ? idx + 1 : idx - 1;
        if (nextIdx < 0 || nextIdx >= SANDBOX_STATUS_ORDER.length) return t;
        const newStatus = SANDBOX_STATUS_ORDER[nextIdx];
        return {
          ...t,
          status: newStatus,
          dueStatus: newStatus === 'done' ? 'done' : t.dueStatus,
          dueLabel: newStatus === 'done' ? 'เสร็จแล้ว' : t.dueLabel,
        };
      })
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  }, []);

  const addTask = useCallback((status: SandboxTaskStatus) => {
    if (!newTaskTitle.trim()) return;
    const newTask: SandboxTask = {
      id: `t-new-${Date.now()}`,
      title: newTaskTitle.trim(),
      status,
      priority: 'medium',
      dueLabel: 'ไม่มีกำหนด',
      dueStatus: 'normal',
      subtasks: [],
      assigneeInitials: 'คุณ',
      assigneeColor: '#1489b4',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setAddingTo(null);
  }, [newTaskTitle]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return {
    tasks,
    expandedId,
    newTaskTitle,
    setNewTaskTitle,
    addingTo,
    setAddingTo,
    moveTask,
    toggleSubtask,
    addTask,
    toggleExpand,
  };
}
