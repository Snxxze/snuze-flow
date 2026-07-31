import React from 'react';
import { SandboxTaskPriority } from '@/components/landing/types';

const PRIORITY_CONFIG: Record<SandboxTaskPriority, { label: string; cls: string }> = {
  high: { label: 'ด่วนมาก', cls: 'text-status-danger bg-status-danger/10' },
  medium: { label: 'ปานกลาง', cls: 'text-status-warning bg-status-warning/10' },
  low: { label: 'ปกติ', cls: 'text-charcoal-subtle bg-canvas' },
};

interface PriorityBadgeProps {
  priority: SandboxTaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { label, cls } = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
};
