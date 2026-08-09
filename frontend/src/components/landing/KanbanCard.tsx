import React from 'react';
import { ArrowLeft, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { PriorityBadge } from '@/components/landing/ui/PriorityBadge';
import { DueBadge } from '@/components/landing/ui/DueBadge';
import { SubtaskProgressBar } from '@/components/landing/ui/SubtaskProgressBar';
import { SandboxTask } from '@/components/landing/types';

interface KanbanCardProps {
  task: SandboxTask;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onMoveLeft,
  onMoveRight,
  onToggleSubtask,
  isExpanded,
  onToggleExpand,
}) => {
  const completedCount = task.subtasks.filter((s) => s.completed).length;

  return (
    <div
      className="group relative rounded border border-surface-border bg-surface p-3.5 shadow-2xs hover:border-charcoal/30 transition-colors cursor-pointer"
      onClick={onToggleExpand}
    >
      {/* Header: Title + Assignee Avatar */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[13px] font-semibold text-charcoal leading-snug group-hover:text-ocean transition-colors">
          {task.title}
        </h4>
        {/* inline style: dynamic color from data — cannot be a Tailwind static class */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
          style={{ backgroundColor: task.assigneeColor }}
          title={task.assigneeInitials}
        >
          {task.assigneeInitials}
        </div>
      </div>

      {/* Priority + Due Date badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <PriorityBadge priority={task.priority} />
        <DueBadge label={task.dueLabel} status={task.dueStatus} />
      </div>

      {/* Subtask Progress Bar */}
      {task.subtasks.length > 0 && (
        <SubtaskProgressBar total={task.subtasks.length} completed={completedCount} />
      )}

      {/* Expanded Subtask Checklist */}
      {isExpanded && task.subtasks.length > 0 && (
        <div
          className="mt-3 space-y-1.5 border-t border-surface-border pt-3 animate-slidedown"
          onClick={(e) => e.stopPropagation()}
        >
          {task.subtasks.map((s) => (
            <button
              key={s.id}
              className="flex w-full items-center gap-2 rounded-md p-1.5 text-left text-xs hover:bg-canvas transition-colors"
              onClick={() => onToggleSubtask(s.id)}
            >
              {s.completed
                ? <CheckSquare className="h-3.5 w-3.5 shrink-0 text-status-done" />
                : <Square className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle/40" />}
              <span className={s.completed ? 'line-through text-charcoal-subtle' : 'text-charcoal'}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Move Buttons */}
      <div
        className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onMoveLeft}
          disabled={!onMoveLeft}
          className="flex items-center gap-1 text-[10px] font-medium text-charcoal-subtle hover:text-ocean disabled:opacity-30 disabled:cursor-default transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />ย้ายกลับ
        </button>
        <button
          onClick={onMoveRight}
          disabled={!onMoveRight}
          className="flex items-center gap-1 text-[10px] font-medium text-charcoal-subtle hover:text-ocean disabled:opacity-30 disabled:cursor-default transition-colors"
        >
          ย้ายต่อ<ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
