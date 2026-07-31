import React from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@/features/tasks/types/task';
import { VirtualList } from '@/components/common/VirtualList';
import { Calendar, Trash2, User, CheckSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskTableViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onStatusChange,
  onDeleteTask,
  onSelectTask,
}) => {
  const { t, i18n } = useTranslation();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="rounded-full bg-status-danger/10 px-2 py-0.5 text-[10px] font-semibold text-status-danger">{t('task.priority_high')}</span>;
      case 'medium':
        return <span className="rounded-full bg-status-warning/10 px-2 py-0.5 text-[10px] font-semibold text-status-warning">{t('task.priority_medium')}</span>;
      default:
        return <span className="rounded-full bg-charcoal/10 px-2 py-0.5 text-[10px] font-medium text-charcoal-subtle">{t('task.priority_low')}</span>;
    }
  };

  const getStatusBadge = (status: 'todo' | 'in_progress' | 'done', taskId: string) => {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(taskId, val as 'todo' | 'in_progress' | 'done')}
        >
          <SelectTrigger className="h-7 w-[125px] text-[11px] font-medium border-surface-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">{t('project.stat_todo')}</SelectItem>
            <SelectItem value="in_progress">{t('project.stat_in_progress')}</SelectItem>
            <SelectItem value="done">{t('project.stat_completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderRow = (task: Task) => {
    return (
      <div
        key={task.id}
        onClick={() => onSelectTask && onSelectTask(task)}
        className="group flex items-center justify-between border-b border-surface-border/60 bg-surface px-4 py-2 hover:bg-canvas transition-colors cursor-pointer text-xs"
      >
        {/* Title & Status */}
        <div className="flex items-center space-x-3 min-w-0 flex-1 pr-4">
          {getStatusBadge(task.status, task.id)}
          <span className="font-medium text-charcoal truncate group-hover:text-ocean transition-colors">
            {task.title}
          </span>
          {task.subtaskStats && task.subtaskStats.totalCount > 0 && (
            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] text-charcoal-subtle">
              <CheckSquare className="h-3 w-3 text-ocean" />
              <span>{task.subtaskStats.completedCount}/{task.subtaskStats.totalCount}</span>
            </span>
          )}
        </div>

        {/* Priority, Assignee, Due Date & Actions */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="w-16">{getPriorityBadge(task.priority)}</div>

          <div className="w-28 flex items-center space-x-1.5 text-charcoal-subtle truncate">
            {task.assignee ? (
              <>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ocean/10 text-[9px] font-bold text-ocean">
                  {task.assignee.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{task.assignee.displayName}</span>
              </>
            ) : (
              <span className="text-charcoal-subtle/50 flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{t('task.unassigned')}</span>
              </span>
            )}
          </div>

          <div className="w-28 text-[11px] text-charcoal-subtle">
            {task.dueDate ? (
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-charcoal-subtle" />
                <span>{new Date(task.dueDate).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US')}</span>
              </span>
            ) : (
              <span className="text-charcoal-subtle/40">-</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-subtle hover:text-status-danger transition-opacity"
            title={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-surface-border bg-surface p-6 text-center text-xs text-charcoal-subtle">
        {t('kanban.empty_filtered')}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-surface-border bg-surface shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-surface-border bg-canvas px-4 py-2.5 text-[11px] font-semibold text-charcoal-subtle">
        <div className="flex-1 pr-4">{t('task.task_title_header')}</div>
        <div className="flex items-center space-x-4 shrink-0">
          <div className="w-16">{t('task.label_priority')}</div>
          <div className="w-28">{t('task.label_assignee')}</div>
          <div className="w-28">{t('task.label_due_date')}</div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Virtualized Rows Container */}
      <VirtualList
        items={tasks}
        estimateSize={38}
        renderItem={renderRow}
        className="max-h-[calc(100vh-280px)]"
      />
    </div>
  );
};
