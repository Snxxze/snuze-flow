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
  AlertTriangle,
  CheckSquare,
  Square,
  Search,
  ArrowUpDown,
  CornerDownRight,
  Plus,
  Loader2,
  GripVertical,
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
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedSourceStatus, setDraggedSourceStatus] = useState<'todo' | 'in_progress' | 'done' | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<'todo' | 'in_progress' | 'done' | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/x-snuzeflow-task-status', task.status);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
    setDraggedSourceStatus(task.status);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedSourceStatus(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: 'todo' | 'in_progress' | 'done') => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumnId === colId) {
        setDragOverColumnId(null);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    const sourceStatus = (e.dataTransfer.getData('application/x-snuzeflow-task-status') as 'todo' | 'in_progress' | 'done') || draggedSourceStatus;

    setDragOverColumnId(null);
    setDraggedTaskId(null);
    setDraggedSourceStatus(null);

    if (!taskId) return;
    if (sourceStatus === targetStatus) return;

    await onStatusChange(taskId, targetStatus);
  };

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

  const { viewMode: hookViewMode, toggleColumnCollapse, isColumnCollapsed } = useTaskViewMode();

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

  const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; dotClass: string }[] = [
    { id: 'todo', title: t('project.stat_todo'), dotClass: 'bg-charcoal/40' },
    { id: 'in_progress', title: t('project.stat_in_progress'), dotClass: 'bg-ocean' },
    { id: 'done', title: t('project.stat_completed'), dotClass: 'bg-status-done' },
  ];

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

  const getDueDateBadge = (dueDateStr?: string | null) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-status-danger">
          <AlertTriangle className="h-2.5 w-2.5" />
          {t('task.due_date_overdue', { days: Math.abs(diffDays) })}
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-status-warning">
          <Calendar className="h-2.5 w-2.5" />
          {t('task.due_date_days_left', { days: diffDays })}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-charcoal-subtle">
          <Calendar className="h-2.5 w-2.5" />
          {due.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    }
  };

  const renderTaskCard = (tObj: Task) => {
    const isTaskExpanded = !!expandedTasks[tObj.id];
    const subtaskItems = subtasksMap[tObj.id] || [];
    const isSubtaskLoading = !!loadingTasks[tObj.id];
    const hasSubtasks = tObj.subtaskStats && tObj.subtaskStats.totalCount > 0;
    const isBeingDragged = draggedTaskId === tObj.id;

    return (
      <div
        key={tObj.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, tObj)}
        onDragEnd={handleDragEnd}
        className={`group rounded border border-surface-border bg-surface p-3 transition-all hover:border-charcoal/30 cursor-pointer ${
          isBeingDragged ? 'opacity-40 border-dashed border-ocean scale-[0.98]' : ''
        }`}
        onClick={() => onSelectTask && onSelectTask(tObj)}
      >
        {/* Title row with Drag Handle */}
        <div className="flex items-start justify-between gap-1.5">
          <div
            className="cursor-grab active:cursor-grabbing shrink-0 pt-0.5 text-charcoal-subtle/40 hover:text-charcoal transition-colors"
            title="ลากเพื่อย้ายสถานะ"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <h4 className="text-sm font-medium text-charcoal leading-snug group-hover:text-ocean transition-colors flex-1">
            {tObj.title}
          </h4>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteTask(tObj.id); }}
            className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-charcoal-subtle hover:text-status-danger transition-opacity"
            title={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        {tObj.description && (
          <p className="mt-1 text-[11px] text-charcoal-subtle line-clamp-2 leading-relaxed pl-5">
            {tObj.description}
          </p>
        )}

        {/* Status select */}
        <div className="mt-2 pl-5" onClick={(e) => e.stopPropagation()}>
          <Select
            value={tObj.status}
            onValueChange={(val) => onStatusChange(tObj.id, val as 'todo' | 'in_progress' | 'done')}
          >
            <SelectTrigger className="h-6 w-[115px] text-[10px] border-surface-border bg-transparent px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">{t('project.stat_todo')}</SelectItem>
              <SelectItem value="in_progress">{t('project.stat_in_progress')}</SelectItem>
              <SelectItem value="done">{t('project.stat_completed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metadata row */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-y-1 gap-x-2 pl-5">
          <div className="flex items-center gap-2">
            {getPriorityBadge(tObj.priority)}
            {tObj.dueDate && <span className="text-charcoal-subtle/40">·</span>}
            {getDueDateBadge(tObj.dueDate)}
          </div>

          <div className="flex items-center gap-2">
            {/* Subtask badge — only show when subtasks exist */}
            {hasSubtasks && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleTaskExpanded(tObj.id); }}
                className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
                  isTaskExpanded ? 'text-ocean' : 'text-charcoal-subtle hover:text-charcoal'
                }`}
                title={isTaskExpanded ? 'ย่อรายการย่อย' : 'ขยายรายการย่อย'}
              >
                <CheckSquare className="h-3 w-3" />
                {tObj.subtaskStats!.completedCount}/{tObj.subtaskStats!.totalCount}
              </button>
            )}

            {tObj.assignee ? (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-ocean/10 text-[9px] font-bold text-ocean"
                title={tObj.assignee.displayName}
              >
                {tObj.assignee.displayName.charAt(0).toUpperCase()}
              </span>
            ) : null}
          </div>
        </div>

        {/* Expanded Inline Subtasks */}
        {isTaskExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 pt-2.5 border-t border-surface-border space-y-1 ml-5"
          >
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
                      onClick={() => toggleSubtaskStatus(tObj.id, sub.id, sub.isCompleted, onSubtasksUpdated)}
                      className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                    >
                      {sub.isCompleted ? (
                        <CheckSquare className="h-3 w-3 text-status-done shrink-0" />
                      ) : (
                        <Square className="h-3 w-3 text-charcoal-subtle shrink-0" />
                      )}
                      <span className={`truncate ${sub.isCompleted ? 'line-through text-charcoal-subtle' : 'text-charcoal'}`}>
                        {sub.title}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteSubtask(tObj.id, sub.id, onSubtasksUpdated)}
                      className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-charcoal-subtle hover:text-status-danger transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <form
                  onSubmit={(e) => handleAddSubtaskSubmit(tObj.id, e)}
                  className="flex items-center gap-1.5 pt-0.5"
                >
                  <CornerDownRight className="h-3 w-3 text-ocean shrink-0" />
                  <Input
                    type="text"
                    placeholder={t('task.detail_subtask_placeholder')}
                    value={newSubtaskTitles[tObj.id] || ''}
                    onChange={(e) =>
                      setNewSubtaskTitles((prev) => ({ ...prev, [tObj.id]: e.target.value }))
                    }
                    className="h-6 text-[10px] bg-surface border-surface-border flex-1 px-1.5"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitles[tObj.id]?.trim()}
                    className="p-1 rounded text-ocean hover:bg-ocean/10 transition-colors disabled:opacity-30"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar — flat, no card wrapper */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center border-b border-surface-border pb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-subtle z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('kanban.search_placeholder')}
            className="pl-8 text-xs h-8 bg-transparent border-surface-border focus:border-charcoal/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as PriorityFilter)}>
            <SelectTrigger className="w-[130px] h-8 text-xs border-surface-border bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kanban.filter_priority_all')}</SelectItem>
              <SelectItem value="high">{t('task.priority_high')}</SelectItem>
              <SelectItem value="medium">{t('task.priority_medium')}</SelectItem>
              <SelectItem value="low">{t('task.priority_low')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={(val) => setAssigneeFilter(val)}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-surface-border bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kanban.filter_assignee_all')}</SelectItem>
              <SelectItem value="unassigned">{t('kanban.filter_assignee_unassigned')}</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>{m.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-[190px] h-8 text-xs border-surface-border bg-transparent">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3 w-3 text-charcoal-subtle shrink-0" />
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

      {/* View Area */}
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
        /* Board View — unified workspace, no per-column card */
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3 md:divide-x md:divide-surface-border min-h-[400px]">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((task) => task.status === col.id);
            const collapsed = isColumnCollapsed(col.id);
            const isColumnOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col px-4 first:pl-0 last:pr-0 ${
                  collapsed ? 'md:w-10 md:min-w-10 md:px-2' : ''
                }`}
              >
                {/* Column header — fixed, no layout shift/animation */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 ${collapsed ? 'md:hidden' : ''}`}>
                    <span className={`h-2 w-2 rounded-full ${col.dotClass}`} />
                    <span className="text-xs font-semibold text-charcoal">{col.title}</span>
                    <span className="text-xs text-charcoal-subtle">{colTasks.length}</span>
                  </div>
                  <button
                    onClick={() => toggleColumnCollapse(col.id)}
                    className="p-1 text-charcoal-subtle hover:text-charcoal transition-colors hidden md:block"
                    title={collapsed ? 'กางคอลัมน์' : 'พับคอลัมน์'}
                  >
                    {collapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Tasks — drop target zone with highlight */}
                {!collapsed && (
                  <div
                    className={`flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[150px] transition-all rounded-lg ${
                      isColumnOver ? 'bg-ocean/5 border-2 border-dashed border-ocean/40 p-2' : 'p-0.5'
                    }`}
                  >
                    {colTasks.length === 0 ? (
                      <p className="text-[11px] text-charcoal-subtle/40 py-6 text-center">
                        ยังไม่มีงาน
                      </p>
                    ) : (
                      colTasks.map((task) => renderTaskCard(task))
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
