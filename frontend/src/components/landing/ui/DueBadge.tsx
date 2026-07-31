import React from 'react';
import { Calendar } from 'lucide-react';
import { SandboxDueStatus } from '@/components/landing/types';

const DUE_STATUS_CLS: Record<Exclude<SandboxDueStatus, 'done'>, string> = {
  overdue: 'text-status-danger bg-status-danger/10',
  warning: 'text-status-warning bg-status-warning/10',
  normal: 'text-charcoal-subtle bg-canvas',
};

interface DueBadgeProps {
  label: string;
  status: SandboxDueStatus;
}

export const DueBadge: React.FC<DueBadgeProps> = ({ label, status }) => {
  if (status === 'done') return null;
  const cls = DUE_STATUS_CLS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      <Calendar className="h-2.5 w-2.5" />
      {label}
    </span>
  );
};
