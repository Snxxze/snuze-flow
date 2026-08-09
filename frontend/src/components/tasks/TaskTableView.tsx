import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@/features/tasks/types/task';
import { useInlineSubtasks } from '@/features/subtasks/hooks/useInlineSubtasks';
import {
  Calendar,
  Trash2,
  User,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Loader2,
  CornerDownRight,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TaskTableViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
  onSubtasksUpdated?: () => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onStatusChange,
  onDeleteTask,
  onSelectTask,
  onSubtasksUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({});

  const {
    expandedTasks,
    subtasksMap,
    loadingTasks,
    toggleTaskExpanded,
    toggleSubtaskStatus,
    createSubtask,
    deleteSubtask,
  } = useInlineSubtasks();

  const handleAddSubtaskSubmit = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitles[taskId] || '';
    if (!title.trim()) return;
    await createSubtask(taskId, title, onSubtasksUpdated);
    setNewSubtaskTitles((prev) => ({ ...prev, [taskId]: '' }));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-medium text-status-danger">
            {t('task.priority_high')}
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-medium text-status-warning">
            {t('task.priority_medium')}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-charcoal-subtle">
            {t('task.priority_low')}
          </span>
        );
    }
  };

  const getStatusSelect = (status: 'todo' | 'in_progress' | 'done', taskId: string) => (
    <div onClick={(e) => e.stopPropagation()}>
      <Select
        value={status}
        onValueChange={(val) => onStatusChange(taskId, val as 'todo' | 'in_progress' | 'done')}
      >
        <SelectTrigger className="h-7 w-[120px] text-[11px] font-medium border-surface-border bg-transparent">
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

  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-charcoal-subtle/50">
        {t('kanban.empty_filtered')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden border-t border-surface-border">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-surface-border py-2 text-[11px] font-medium text-charcoal-subtle">
        <div className="flex-1 pr-4">{t('task.task_title_header')}</div>
        <div className="flex items-center space-x-4 shrink-0">
          <div className="w-16">{t('task.label_priority')}</div>
          <div className="w-28">{t('task.label_assignee')}</div>
          <div className="w-28">{t('task.label_due_date')}</div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-surface-border/50 max-h-[calc(100vh-280px)] overflow-y-auto">
        {tasks.map((task) => {
          const isTaskExpanded = !!expandedTasks[task.id];
          const subtaskItems = subtasksMap[task.id] || [];
          const isSubtaskLoading = !!loadingTasks[task.id];
          const hasSubtasks = task.subtaskStats && task.subtaskStats.totalCount > 0;

          return (
            <div key={task.id} className="flex flex-col">
              {/* Table Row */}
              <div
                onClick={() => onSelectTask && onSelectTask(task)}
                className="group flex items-center justify-between py-2 hover:bg-canvas/40 transition-colors cursor-pointer text-xs"
              >
                {/* Title & Controls */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-4">
                  {/* Expand toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskExpanded(task.id);
                    }}
                    className="p-0.5 text-charcoal-subtle hover:text-ocean transition-colors shrink-0"
                    title={isTaskExpanded ? 'ย่อรายการย่อย' : 'ขยายรายการย่อย'}
                  >
                    {isSubtaskLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                    ) : isTaskExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-ocean" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {getStatusSelect(task.status, task.id)}

                  <span className="font-medium text-charcoal truncate group-hover:text-ocean transition-colors">
                    {task.title}
                  </span>

                  {/* Subtask badge — only when has subtasks */}
                  {hasSubtasks && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpanded(task.id);
                      }}
                      className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors shrink-0 ${
                        isTaskExpanded ? 'text-ocean' : 'text-charcoal-subtle hover:text-charcoal'
                      }`}
                    >
                      <CheckSquare className="h-3 w-3" />
                      {task.subtaskStats!.completedCount}/{task.subtaskStats!.totalCount}
                    </button>
                  )}
                </div>

                {/* Priority, Assignee, Due Date & Delete */}
                <div className="flex items-center space-x-4 shrink-0">
                  <div className="w-16">{getPriorityBadge(task.priority)}</div>

                  <div className="w-28 flex items-center gap-1.5 text-charcoal-subtle truncate">
                    {task.assignee ? (
                      <>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ocean/10 text-[9px] font-bold text-ocean">
                          {task.assignee.displayName.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate text-[11px]">{task.assignee.displayName}</span>
                      </>
                    ) : (
                      <span className="text-charcoal-subtle/40 flex items-center gap-1 text-[11px]">
                        <User className="h-3 w-3" />
                        {t('task.unassigned')}
                      </span>
                    )}
                  </div>

                  <div className="w-28 text-[11px] text-charcoal-subtle">
                    {task.dueDate ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString(
                          i18n.language === 'th' ? 'th-TH' : 'en-US'
                        )}
                      </span>
                    ) : (
                      <span className="text-charcoal-subtle/30">—</span>
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

              {/* Inline Subtasks */}
              {isTaskExpanded && (
                <div className="border-t border-surface-border/40 pl-10 pr-4 py-2 space-y-1 bg-canvas/20">
                  {isSubtaskLoading ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-charcoal-subtle">
                      <Loader2 className="h-3 w-3 animate-spin text-ocean" />
                      {t('task.detail_subtask_loading')}
                    </div>
                  ) : (
                    <>
                      {subtaskItems.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between py-0.5 text-[11px] group/sub"
                        >
                          <button
                            onClick={() =>
                              toggleSubtaskStatus(task.id, sub.id, sub.isCompleted, onSubtasksUpdated)
                            }
                            className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                          >
                            <CornerDownRight className="h-3 w-3 text-charcoal-subtle shrink-0" />
                            {sub.isCompleted ? (
                              <CheckSquare className="h-3.5 w-3.5 text-status-done shrink-0" />
                            ) : (
                              <Square className="h-3.5 w-3.5 text-charcoal-subtle shrink-0" />
                            )}
                            <span
                              className={`truncate ${
                                sub.isCompleted
                                  ? 'line-through text-charcoal-subtle'
                                  : 'text-charcoal font-medium'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </button>
                          <button
                            onClick={() => deleteSubtask(task.id, sub.id, onSubtasksUpdated)}
                            className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-charcoal-subtle hover:text-status-danger transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <form
                        onSubmit={(e) => handleAddSubtaskSubmit(task.id, e)}
                        className="flex items-center gap-1.5 pt-0.5"
                      >
                        <CornerDownRight className="h-3 w-3 text-ocean shrink-0" />
                        <Input
                          type="text"
                          placeholder={t('task.detail_subtask_placeholder')}
                          value={newSubtaskTitles[task.id] || ''}
                          onChange={(e) =>
                            setNewSubtaskTitles((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          className="h-7 text-xs bg-surface border-surface-border flex-1"
                        />
                        <button
                          type="submit"
                          disabled={!newSubtaskTitles[task.id]?.trim()}
                          className="p-1 rounded text-ocean hover:bg-ocean/10 transition-colors disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
