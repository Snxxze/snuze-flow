import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@/features/tasks/types/task';
import { useInlineSubtasks } from '@/features/subtasks/hooks/useInlineSubtasks';
import {
  Calendar,
  Trash2,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Plus,
  Loader2,
  CornerDownRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TaskListViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
  onSubtasksUpdated?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onStatusChange,
  onDeleteTask,
  onSelectTask,
  onSubtasksUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
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

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleAddSubtaskSubmit = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitles[taskId] || '';
    if (!title.trim()) return;

    await createSubtask(taskId, title, onSubtasksUpdated);
    setNewSubtaskTitles((prev) => ({ ...prev, [taskId]: '' }));
  };

  const groups: { id: 'todo' | 'in_progress' | 'done'; title: string; color: string }[] = [
    { id: 'todo', title: t('project.stat_todo'), color: 'bg-charcoal/40' },
    { id: 'in_progress', title: t('project.stat_in_progress'), color: 'bg-ocean' },
    { id: 'done', title: t('project.stat_completed'), color: 'bg-status-done' },
  ];

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

  const getDueDateBadge = (dueDateStr?: string | null) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center space-x-1 rounded-md bg-status-danger/10 px-2 py-0.5 text-[10px] font-semibold text-status-danger border border-status-danger/20">
          <AlertTriangle className="h-3 w-3" />
          <span>{t('task.due_date_overdue', { days: Math.abs(diffDays) })}</span>
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center space-x-1 rounded-md bg-status-warning/10 px-2 py-0.5 text-[10px] font-semibold text-status-warning border border-status-warning/20">
          <Calendar className="h-3 w-3" />
          <span>{t('task.due_date_days_left', { days: diffDays })}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 text-[10px] text-charcoal-subtle">
          <Calendar className="h-3 w-3 text-charcoal-subtle" />
          <span>
            {due.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </span>
      );
    }
  };

  const renderStatusSelect = (task: Task) => {
    return (
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Select
          value={task.status}
          onValueChange={(val) => onStatusChange(task.id, val as 'todo' | 'in_progress' | 'done')}
        >
          <SelectTrigger className="h-7 w-[115px] text-[11px] font-semibold border-surface-border bg-surface shadow-2xs">
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
    <div className="space-y-4">
      {groups.map((group) => {
        const groupTasks = tasks.filter((task) => task.status === group.id);
        const isCollapsed = collapsedGroups[group.id];

        return (
          <div
            key={group.id}
            className="rounded-md border border-surface-border bg-surface shadow-xs overflow-hidden"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleGroup(group.id)}
              className="flex items-center justify-between border-b border-surface-border/60 bg-canvas/60 px-4 py-2.5 cursor-pointer hover:bg-canvas transition-colors select-none"
            >
              <div className="flex items-center space-x-2">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-charcoal-subtle" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-charcoal-subtle" />
                )}
                <span className={`h-2.5 w-2.5 rounded-full ${group.color}`} />
                <h3 className="font-bold text-charcoal text-xs">{group.title}</h3>
                <span className="rounded-full bg-surface border border-surface-border px-2 py-0.5 font-data text-[10px] font-semibold text-charcoal-subtle">
                  {groupTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks List */}
            {!isCollapsed && (
              <div className="divide-y divide-surface-border/50">
                {groupTasks.length === 0 ? (
                  <div className="p-3.5 text-center text-[11px] text-charcoal-subtle/50 italic">
                    {t('kanban.empty_filtered')}
                  </div>
                ) : (
                  groupTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const isTaskExpanded = !!expandedTasks[task.id];
                    const subtaskItems = subtasksMap[task.id] || [];
                    const isSubtaskLoading = !!loadingTasks[task.id];

                    return (
                      <div key={task.id} className="flex flex-col">
                        {/* Parent Task Row */}
                        <div
                          onClick={() => onSelectTask && onSelectTask(task)}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-canvas/40 transition-colors cursor-pointer text-xs gap-2"
                        >
                          {/* Left Controls & Title */}
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                            {/* Expand Subtasks Icon Button */}
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

                            {/* Status Dropdown Select */}
                            {renderStatusSelect(task)}

                            {/* Title & Description */}
                            <div className="min-w-0 flex-1">
                              <span
                                className={`font-medium leading-tight block truncate transition-colors ${
                                  isDone
                                    ? 'text-charcoal-subtle line-through'
                                    : 'text-charcoal group-hover:text-ocean'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-[11px] text-charcoal-subtle/80 truncate mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Metadata & Actions */}
                          <div className="flex items-center space-x-3 shrink-0 ml-7 sm:ml-0">
                            {getPriorityBadge(task.priority)}
                            {getDueDateBadge(task.dueDate)}

                            {/* Subtask Counter Badge */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpanded(task.id);
                              }}
                              className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
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

                            {task.assignee ? (
                              <span
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-ocean/10 text-[9px] font-bold text-ocean"
                                title={task.assignee.displayName}
                              >
                                {task.assignee.displayName.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <span
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-canvas text-charcoal-subtle border border-surface-border"
                                title={t('task.unassigned')}
                              >
                                <User className="h-3 w-3" />
                              </span>
                            )}

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
                          <div className="bg-canvas/30 border-t border-surface-border/40 pl-9 pr-4 py-2.5 space-y-2">
                            {isSubtaskLoading ? (
                              <div className="flex items-center space-x-2 text-xs text-charcoal-subtle py-1">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                                <span>{t('task.detail_subtask_loading')}</span>
                              </div>
                            ) : (
                              <>
                                {/* Existing Subtasks */}
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
                                      onClick={() =>
                                        deleteSubtask(task.id, sub.id, onSubtasksUpdated)
                                      }
                                      className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-charcoal-subtle hover:text-status-danger transition-opacity"
                                      title={t('common.delete')}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}

                                {/* Quick Subtask Form */}
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
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
