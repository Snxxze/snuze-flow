import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectStats } from '@/features/projects/types/project';
import { CheckCircle2, Clock, AlertTriangle, Users, ListTodo, TrendingUp } from 'lucide-react';

interface ProjectSummaryWidgetProps {
  stats: ProjectStats;
}

export const ProjectSummaryWidget: React.FC<ProjectSummaryWidgetProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 rounded-md border border-surface-border bg-surface p-5 shadow-sm space-y-4">
      {/* Header & Overall Completion Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-charcoal flex items-center space-x-1.5">
            <TrendingUp className="h-4 w-4 text-ocean" />
            <span>{t('project.progress_title')}</span>
          </h3>
          <p className="text-xs text-charcoal-subtle">{t('project.progress_desc')}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-lg font-bold text-ocean">{stats.completionRate}%</div>
            <div className="text-[10px] text-charcoal-subtle">{t('project.completed_label')}</div>
          </div>
          <div className="w-32 h-2.5 rounded-full bg-canvas border border-surface-border overflow-hidden">
            <div
              className="h-full bg-status-done transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 pt-2 border-t border-surface-border/50">
        <div className="rounded-md border border-surface-border bg-canvas p-3 text-center">
          <div className="flex justify-center text-charcoal-subtle mb-1">
            <ListTodo className="h-4 w-4" />
          </div>
          <div className="text-xs text-charcoal-subtle">{t('project.stat_all_tasks')}</div>
          <div className="text-base font-bold text-charcoal mt-0.5">{stats.totalTasks}</div>
        </div>

        <div className="rounded-md border border-surface-border bg-canvas p-3 text-center">
          <div className="flex justify-center text-charcoal-subtle mb-1">
            <Clock className="h-4 w-4 text-charcoal-subtle" />
          </div>
          <div className="text-xs text-charcoal-subtle">{t('project.stat_todo')}</div>
          <div className="text-base font-bold text-charcoal mt-0.5">{stats.todoTasks}</div>
        </div>

        <div className="rounded-md border border-surface-border bg-canvas p-3 text-center">
          <div className="flex justify-center text-ocean mb-1">
            <Clock className="h-4 w-4 text-ocean animate-spin" />
          </div>
          <div className="text-xs text-charcoal-subtle">{t('project.stat_in_progress')}</div>
          <div className="text-base font-bold text-ocean mt-0.5">{stats.inProgressTasks}</div>
        </div>

        <div className="rounded-md border border-surface-border bg-canvas p-3 text-center">
          <div className="flex justify-center text-status-done mb-1">
            <CheckCircle2 className="h-4 w-4 text-status-done" />
          </div>
          <div className="text-xs text-charcoal-subtle">{t('project.stat_completed')}</div>
          <div className="text-base font-bold text-status-done mt-0.5">{stats.doneTasks}</div>
        </div>

        <div className={`rounded-md border p-3 text-center ${
          stats.overdueTasks > 0
            ? 'border-status-danger/30 bg-status-danger/5 text-status-danger'
            : 'border-surface-border bg-canvas text-charcoal-subtle'
        }`}>
          <div className="flex justify-center mb-1">
            <AlertTriangle className={`h-4 w-4 ${stats.overdueTasks > 0 ? 'text-status-danger' : 'text-charcoal-subtle'}`} />
          </div>
          <div className="text-xs">{t('project.stat_overdue')}</div>
          <div className="text-base font-bold mt-0.5">{stats.overdueTasks}</div>
        </div>

        <div className="rounded-md border border-surface-border bg-canvas p-3 text-center">
          <div className="flex justify-center text-ocean mb-1">
            <Users className="h-4 w-4 text-ocean" />
          </div>
          <div className="text-xs text-charcoal-subtle">{t('project.stat_members')}</div>
          <div className="text-base font-bold text-charcoal mt-0.5">{stats.totalMembers}</div>
        </div>
      </div>
    </div>
  );
};
