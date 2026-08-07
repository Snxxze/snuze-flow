import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMember } from '@/features/projects/types/project';
import { Task } from '@/features/tasks/types/task';
import { useTaskFilters, PriorityFilter, SortOption } from '@/features/tasks/hooks/useTaskFilters';
import { useTaskViewMode, ViewMode } from '@/features/tasks/hooks/useTaskViewMode';
import { useInlineSubtasks } from '@/features/subtasks/hooks/useInlineSubtasks';
import { TaskTableView } from '@/components/tasks/TaskTableView';
import { TaskListView } from '@/components/tasks/TaskListView';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  CheckSquare,
  Square,
  Search,
  ArrowUpDown,
  CornerDownRight,
  Plus,
  Loader2,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  members?: ProjectMember[];
  viewMode?: ViewMode;
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
  onSubtasksUpdated?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  members = [],
  viewMode: controlledViewMode,
  onStatusChange,
  onDeleteTask,
  onSelectTask,
  onSubtasksUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({});

  const {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    sortBy,
    setSortBy,
    filteredTasks,
  } = useTaskFilters(tasks);

  const {
    viewMode: hookViewMode,
    toggleColumnCollapse,
    isColumnCollapsed,
  } = useTaskViewMode();

  const {
    expandedTasks,
    subtasksMap,
    loadingTasks,
    toggleTaskExpanded,
    toggleSubtaskStatus,
    createSubtask,
    deleteSubtask,
  } = useInlineSubtasks();

  const activeViewMode = controlledViewMode || hookViewMode;

  const handleAddSubtaskSubmit = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitles[taskId] || '';
    if (!title.trim()) return;

    await createSubtask(taskId, title, onSubtasksUpdated);
    setNewSubtaskTitles((prev) => ({ ...prev, [taskId]: '' }));
  };

  const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; color: string }[] = [
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

  const renderTaskCard = (tObj: Task, colId: string) => {
    const isTaskExpanded = !!expandedTasks[tObj.id];
    const subtaskItems = subtasksMap[tObj.id] || [];
    const isSubtaskLoading = !!loadingTasks[tObj.id];

    return (
      <div
        key={tObj.id}
        className="group rounded-md border border-surface-border bg-surface p-3.5 shadow-xs transition-all hover:border-ocean/40 hover:shadow-sm cursor-pointer"
        onClick={() => onSelectTask && onSelectTask(tObj)}
      >
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-charcoal text-sm leading-snug group-hover:text-ocean transition-colors">
            {tObj.title}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(tObj.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-subtle hover:text-status-danger transition-opacity"
            title={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {tObj.description && (
          <p className="mt-1.5 text-xs text-charcoal-subtle line-clamp-2 leading-relaxed">
            {tObj.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-surface-border/40 pt-2.5">
          <div className="flex items-center space-x-2">
            {getPriorityBadge(tObj.priority)}
            {getDueDateBadge(tObj.dueDate)}
          </div>

          <div className="flex items-center space-x-2">
            {/* Subtask Button Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskExpanded(tObj.id);
              }}
              className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                isTaskExpanded
                  ? 'bg-ocean/10 text-ocean border-ocean/30'
                  : 'bg-canvas text-charcoal-subtle border-surface-border hover:bg-surface'
              }`}
              title={isTaskExpanded ? 'ย่อรายการย่อย' : 'ขยายรายการย่อย'}
            >
              <CheckSquare className="h-3 w-3 text-ocean" />
              <span>
                {tObj.subtaskStats
                  ? `${tObj.subtaskStats.completedCount}/${tObj.subtaskStats.totalCount}`
                  : '0/0'}
              </span>
            </button>

            {tObj.assignee ? (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-ocean/10 text-[9px] font-bold text-ocean"
                title={tObj.assignee.displayName}
              >
                {tObj.assignee.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-canvas text-charcoal-subtle border border-surface-border"
                title={t('task.unassigned')}
              >
                <User className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        {/* Expanded Inline Subtasks Checklist inside Card */}
        {isTaskExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 rounded-md bg-canvas/60 p-2 border border-surface-border/60 text-xs space-y-1.5"
          >
            {isSubtaskLoading ? (
              <div className="flex items-center space-x-2 text-[11px] text-charcoal-subtle py-1">
                <Loader2 className="h-3 w-3 animate-spin text-ocean" />
                <span>{t('task.detail_subtask_loading')}</span>
              </div>
            ) : (
              <>
                {subtaskItems.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-surface text-[11px] group/sub"
                  >
                    <button
                      onClick={() =>
                        toggleSubtaskStatus(tObj.id, sub.id, sub.isCompleted, onSubtasksUpdated)
                      }
                      className="flex items-center space-x-1.5 text-left flex-1 min-w-0"
                    >
                      {sub.isCompleted ? (
                        <CheckSquare className="h-3 w-3 text-status-done shrink-0" />
                      ) : (
                        <Square className="h-3 w-3 text-charcoal-subtle shrink-0 hover:text-ocean" />
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
                      onClick={() => deleteSubtask(tObj.id, sub.id, onSubtasksUpdated)}
                      className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-charcoal-subtle hover:text-status-danger transition-opacity"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <form
                  onSubmit={(e) => handleAddSubtaskSubmit(tObj.id, e)}
                  className="flex items-center space-x-1.5 pt-1"
                >
                  <CornerDownRight className="h-3 w-3 text-ocean shrink-0" />
                  <Input
                    type="text"
                    placeholder={t('task.detail_subtask_placeholder')}
                    value={newSubtaskTitles[tObj.id] || ''}
                    onChange={(e) =>
                      setNewSubtaskTitles((prev) => ({
                        ...prev,
                        [tObj.id]: e.target.value,
                      }))
                    }
                    className="h-6 text-[10px] bg-surface border-surface-border flex-1 px-1.5"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitles[tObj.id]?.trim()}
                    className="p-1 rounded bg-ocean/10 text-ocean hover:bg-ocean hover:text-white transition-colors disabled:opacity-30"
                    title={t('task.detail_subtask_add_btn')}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <div
          className="flex items-center space-x-1 mt-2.5 border-t border-surface-border/30 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {colId !== 'todo' && (
            <button
              onClick={() => onStatusChange(tObj.id, colId === 'done' ? 'in_progress' : 'todo')}
              className="rounded-md p-1 text-charcoal-subtle hover:bg-canvas hover:text-charcoal"
              title="ย้ายกลับ"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {colId !== 'done' && (
            <button
              onClick={() => onStatusChange(tObj.id, colId === 'todo' ? 'in_progress' : 'done')}
              className="rounded-md p-1 text-charcoal-subtle hover:bg-canvas hover:text-ocean ml-auto"
              title="ย้ายไปข้างหน้า"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search, Filter & Sorting Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-md border border-surface-border bg-surface p-3.5 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-subtle z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('kanban.search_placeholder')}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onValueChange={(val) => setPriorityFilter(val as PriorityFilter)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kanban.filter_priority_all')}</SelectItem>
              <SelectItem value="high">{t('task.priority_high')}</SelectItem>
              <SelectItem value="medium">{t('task.priority_medium')}</SelectItem>
              <SelectItem value="low">{t('task.priority_low')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={assigneeFilter} onValueChange={(val) => setAssigneeFilter(val)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kanban.filter_assignee_all')}</SelectItem>
              <SelectItem value="unassigned">{t('kanban.filter_assignee_unassigned')}</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sorting Dropdown */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-[230px]">
              <div className="flex items-center space-x-1.5 truncate">
                <ArrowUpDown className="h-3 w-3 text-ocean shrink-0" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date_asc">{t('kanban.sort_due_date_asc')}</SelectItem>
              <SelectItem value="priority_desc">{t('kanban.sort_priority_desc')}</SelectItem>
              <SelectItem value="created_at_desc">{t('kanban.sort_created_at_desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main View Area: Board vs List vs Table */}
      {activeViewMode === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          onStatusChange={onStatusChange}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
          onSubtasksUpdated={onSubtasksUpdated}
        />
      ) : activeViewMode === 'table' ? (
        <TaskTableView
          tasks={filteredTasks}
          onStatusChange={onStatusChange}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
          onSubtasksUpdated={onSubtasksUpdated}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((task) => task.status === col.id);
            const collapsed = isColumnCollapsed(col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-xl border border-surface-border bg-canvas/30 p-4 transition-all ${
                  collapsed ? 'md:w-16 md:min-w-16' : 'w-full'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                    <h3
                      className={`font-semibold text-charcoal text-sm truncate ${
                        collapsed ? 'md:hidden' : ''
                      }`}
                    >
                      {col.title}
                    </h3>
                    <span className="rounded-pill bg-canvas border border-surface-border px-1.5 py-0.5 font-data text-[10px] text-charcoal-subtle">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleColumnCollapse(col.id)}
                    className="p-1 rounded-md text-charcoal-subtle hover:bg-canvas hidden md:block"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Tasks Container */}
                {!collapsed && (
                  <div className="flex-1 min-h-0 max-h-[calc(100vh-320px)] overflow-y-auto space-y-3 pr-1">
                    {colTasks.length === 0 ? (
                      <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-surface-border/60 text-[11px] text-charcoal-subtle/50">
                        {t('kanban.empty_filtered')}
                      </div>
                    ) : (
                      colTasks.map((task) => renderTaskCard(task, col.id))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
