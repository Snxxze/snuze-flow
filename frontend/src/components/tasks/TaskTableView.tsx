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
          <span className="rounded-full bg-status-danger/10 px-2 py-0.5 text-[10px] font-semibold text-status-danger">
            {t('task.priority_high')}
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-full bg-status-warning/10 px-2 py-0.5 text-[10px] font-semibold text-status-warning">
            {t('task.priority_medium')}
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-charcoal/10 px-2 py-0.5 text-[10px] font-medium text-charcoal-subtle">
            {t('task.priority_low')}
          </span>
        );
    }
  };

  const getStatusBadge = (status: 'todo' | 'in_progress' | 'done', taskId: string) => {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(taskId, val as 'todo' | 'in_progress' | 'done')}
        >
          <SelectTrigger className="h-7 w-[120px] text-[11px] font-medium border-surface-border">
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

      {/* Rows List */}
      <div className="divide-y divide-surface-border/50 max-h-[calc(100vh-280px)] overflow-y-auto">
        {tasks.map((task) => {
          const isTaskExpanded = !!expandedTasks[task.id];
          const subtaskItems = subtasksMap[task.id] || [];
          const isSubtaskLoading = !!loadingTasks[task.id];

          return (
            <div key={task.id} className="flex flex-col">
              {/* Table Row */}
              <div
                onClick={() => onSelectTask && onSelectTask(task)}
                className="group flex items-center justify-between border-b border-surface-border/40 bg-surface px-4 py-2 hover:bg-canvas transition-colors cursor-pointer text-xs"
              >
                {/* Title & Controls */}
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskExpanded(task.id);
                    }}
                    className="p-1 rounded hover:bg-surface border border-transparent hover:border-surface-border transition-colors text-charcoal-subtle hover:text-ocean shrink-0"
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

                  {getStatusBadge(task.status, task.id)}

                  <span className="font-medium text-charcoal truncate group-hover:text-ocean transition-colors">
                    {task.title}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskExpanded(task.id);
                    }}
                    className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors shrink-0 ${
                      isTaskExpanded
                        ? 'bg-ocean/10 text-ocean border-ocean/30'
                        : 'bg-canvas text-charcoal-subtle border-surface-border hover:bg-surface'
                    }`}
                  >
                    <CheckSquare className="h-3 w-3 text-ocean" />
                    <span>
                      {task.subtaskStats
                        ? `${task.subtaskStats.completedCount}/${task.subtaskStats.totalCount}`
                        : '0/0'}
                    </span>
                  </button>
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
                        <span>
                          {new Date(task.dueDate).toLocaleDateString(
                            i18n.language === 'th' ? 'th-TH' : 'en-US'
                          )}
                        </span>
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

              {/* Inline Subtasks Accordion Content */}
              {isTaskExpanded && (
                <div className="bg-canvas/40 border-b border-surface-border/60 pl-12 pr-4 py-2.5 space-y-2">
                  {isSubtaskLoading ? (
                    <div className="flex items-center space-x-2 text-xs text-charcoal-subtle py-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                      <span>{t('task.detail_subtask_loading')}</span>
                    </div>
                  ) : (
                    <>
                      {/* Subtask Items */}
                      {subtaskItems.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-surface border border-transparent hover:border-surface-border text-xs transition-colors group/sub"
                        >
                          <button
                            onClick={() =>
                              toggleSubtaskStatus(
                                task.id,
                                sub.id,
                                sub.isCompleted,
                                onSubtasksUpdated
                              )
                            }
                            className="flex items-center space-x-2 text-left flex-1 min-w-0"
                          >
                            <CornerDownRight className="h-3 w-3 text-charcoal-subtle shrink-0" />
                            {sub.isCompleted ? (
                              <CheckSquare className="h-3.5 w-3.5 text-status-done shrink-0" />
                            ) : (
                              <Square className="h-3.5 w-3.5 text-charcoal-subtle shrink-0 hover:text-ocean" />
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
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Quick Add Form */}
                      <form
                        onSubmit={(e) => handleAddSubtaskSubmit(task.id, e)}
                        className="flex items-center space-x-2 pt-1"
                      >
                        <CornerDownRight className="h-3 w-3 text-ocean shrink-0" />
                        <Input
                          type="text"
                          placeholder={t('task.detail_subtask_placeholder')}
                          value={newSubtaskTitles[task.id] || ''}
                          onChange={(e) =>
                            setNewSubtaskTitles((prev) => ({
                              ...prev,
                              [task.id]: e.target.value,
                            }))
                          }
                          className="h-7 text-xs bg-surface border-surface-border flex-1"
                        />
                        <button
                          type="submit"
                          disabled={!newSubtaskTitles[task.id]?.trim()}
                          className="p-1 rounded bg-ocean/10 text-ocean hover:bg-ocean hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-ocean/10 disabled:hover:text-ocean"
                          title={t('task.detail_subtask_add_btn')}
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
