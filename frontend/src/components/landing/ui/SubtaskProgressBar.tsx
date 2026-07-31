import React from 'react';

interface SubtaskProgressBarProps {
  total: number;
  completed: number;
}

export const SubtaskProgressBar: React.FC<SubtaskProgressBarProps> = ({ total, completed }) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-charcoal-subtle font-medium">{completed}/{total} รายการ</span>
        <span className="text-[10px] font-semibold text-charcoal">{pct}%</span>
      </div>
      <div className="wave-track">
        {/* danger modifier ใช้ class จาก index.css: .wave-fill.danger */}
        <div className={`wave-fill ${pct < 30 ? 'danger' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
