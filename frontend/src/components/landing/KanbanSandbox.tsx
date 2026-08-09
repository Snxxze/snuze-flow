import React from 'react';
import { Plus, X } from 'lucide-react';
import { KanbanCard } from '@/components/landing/KanbanCard';
import { WaveLogo } from '@/components/landing/WaveLogo';
import { useSandboxState } from '@/hooks/landing/useSandboxState';
import { SandboxTaskStatus, SANDBOX_STATUS_ORDER } from '@/components/landing/types';

const COLUMNS: { status: SandboxTaskStatus; label: string; colorCls: string }[] = [
  { status: 'todo', label: 'ต้องทำ', colorCls: 'bg-charcoal/10 text-charcoal' },
  { status: 'in_progress', label: 'กำลังทำ', colorCls: 'bg-ocean/10 text-ocean' },
  { status: 'done', label: 'เสร็จสิ้น', colorCls: 'bg-status-done/10 text-status-done' },
];

export const KanbanSandbox: React.FC = () => {
  const {
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
  } = useSandboxState();

  return (
    <div className="w-full overflow-x-auto rounded border border-surface-border bg-surface p-4 shadow-2xs">
      {/* Sandbox Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-charcoal shadow-xs">
            <WaveLogo size={18} />
          </div>
          <span className="text-sm font-semibold text-charcoal">SnuzeFlow — ทดลองใช้งาน</span>
        </div>
        <span className="rounded-full bg-ocean/10 px-2.5 py-0.5 text-[10px] font-semibold text-ocean">
          Sandbox Mode
        </span>
      </div>

      {/* Kanban Columns — Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 sm:min-w-[600px]">
        {COLUMNS.map(({ status, label, colorCls }) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          const statusIdx = SANDBOX_STATUS_ORDER.indexOf(status);

          return (
            <div key={status} className="flex flex-col gap-2">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${colorCls}`}>
                    {label}
                  </span>
                  <span className="text-[11px] font-mono text-charcoal-subtle/60">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(addingTo === status ? null : status)}
                  className="rounded p-1 text-charcoal-subtle/40 hover:text-ocean hover:bg-canvas transition-colors"
                  title={`เพิ่มงานในคอลัมน์ ${label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add Task Inline Form */}
              {addingTo === status && (
                <div
                  className="rounded border border-ocean/30 bg-surface p-3 animate-slidedown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTask(status);
                      if (e.key === 'Escape') setAddingTo(null);
                    }}
                    placeholder="ชื่องาน... (Enter เพื่อบันทึก)"
                    className="w-full rounded border border-surface-border bg-canvas px-2.5 py-1.5 text-xs text-charcoal placeholder-charcoal-subtle/50 focus:border-ocean focus:outline-none"
                  />
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => addTask(status)}
                      className="flex-1 rounded bg-ocean px-2 py-1 text-[11px] font-semibold text-white hover:bg-ocean-hover transition-colors"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="rounded p-1 text-charcoal-subtle/50 hover:text-status-danger transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Task Cards */}
              <div className="flex flex-col gap-2">
                {columnTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onMoveLeft={statusIdx > 0 ? () => moveTask(task.id, 'left') : undefined}
                    onMoveRight={statusIdx < 2 ? () => moveTask(task.id, 'right') : undefined}
                    onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                    isExpanded={expandedId === task.id}
                    onToggleExpand={() => toggleExpand(task.id)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="flex h-14 items-center justify-center rounded border border-dashed border-surface-border text-[11px] text-charcoal-subtle/40">
                    ยังไม่มีงาน
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[10px] text-charcoal-subtle/50">
        คลิกการ์ดเพื่อดู Subtask · กด + เพื่อเพิ่มงาน · ย้ายการ์ดด้วยปุ่มลูกศร
      </p>
    </div>
  );
};
