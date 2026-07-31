import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/features/auth/context/AuthContext';
import { taskService } from '@/features/tasks/services/taskService';
import { projectService } from '@/features/projects/services/projectService';
import { Task } from '@/features/tasks/types/task';
import { Project } from '@/features/projects/types/project';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Calendar,
  Hand,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projData, taskData] = await Promise.all([
        projectService.listProjects(),
        taskService.getDashboardTasks(),
      ]);
      setProjects(projData);
      setTasks(taskData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="rounded-full bg-status-danger/10 px-2 py-0.5 text-[10px] font-semibold text-status-danger">{t('task.priority_high')}</span>;
      case 'medium':
        return <span className="rounded-full bg-status-warning/10 px-2 py-0.5 text-[10px] font-semibold text-status-warning">{t('task.priority_medium')}</span>;
      default:
        return <span className="rounded-full bg-charcoal/10 px-2 py-0.5 text-[10px] font-medium text-charcoal-subtle">{t('task.priority_low')}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <span className="rounded-full bg-charcoal/10 px-2 py-0.5 text-[10px] font-semibold text-charcoal-subtle">{t('project.stat_todo')}</span>;
      case 'in_progress':
        return <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-semibold text-ocean">{t('project.stat_in_progress')}</span>;
      case 'done':
        return <span className="rounded-full bg-status-done/10 px-2 py-0.5 text-[10px] font-semibold text-status-done">{t('project.stat_completed')}</span>;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      recentProjects={recentProjects}
      currentPageTitle={t('project.summary_title')}
    >
      <main className="w-full px-6 py-8 sm:px-8 lg:px-10">
        {/* Section 1: Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl text-charcoal flex items-center gap-2">
            <span>{i18n.language === 'th' ? `สวัสดี, ${user?.displayName}` : `Hello, ${user?.displayName}`}</span>
            <Hand className="h-6 w-6 text-[#f5a623] animate-wave shrink-0" />
          </h1>
          <p className="text-xs text-charcoal-subtle mt-1.5">
            {i18n.language === 'th'
              ? 'สรุปงานและเป้าหมายโครงการทั้งหมดของคุณในพื้นที่ทำงานเดียว'
              : 'Summary of all your tasks and project milestones in a single workspace.'}
          </p>
        </div>

        {/* Section 2: Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Tasks */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex items-center space-x-3.5 shadow-2xs">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-charcoal/5 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-charcoal-subtle" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle/80">
                {t('project.stat_all_tasks')}
              </p>
              <h3 className="text-xl font-bold text-charcoal mt-0.5">{isLoading ? '...' : totalTasks}</h3>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex items-center space-x-3.5 shadow-2xs">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-ocean/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-ocean" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle/80">
                {t('project.stat_in_progress')}
              </p>
              <h3 className="text-xl font-bold text-charcoal mt-0.5">{isLoading ? '...' : inProgressTasks}</h3>
            </div>
          </div>

          {/* Card 3: Done */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex items-center space-x-3.5 shadow-2xs">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-status-done/10 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-status-done" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle/80">
                {t('project.stat_completed')}
              </p>
              <h3 className="text-xl font-bold text-charcoal mt-0.5">{isLoading ? '...' : doneTasks}</h3>
            </div>
          </div>

          {/* Card 4: High Priority */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex items-center space-x-3.5 shadow-2xs">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-status-danger/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-status-danger" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-subtle/80">
                {i18n.language === 'th' ? 'งานด่วนพิเศษ' : 'High Priority'}
              </p>
              <h3 className="text-xl font-bold text-charcoal mt-0.5">{isLoading ? '...' : highPriorityTasks}</h3>
            </div>
          </div>
        </div>

        {/* Section 3: Tasks Panel */}
        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-2xs">
          <h2 className="font-display font-semibold text-[16px] text-charcoal mb-4 flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-ocean" />
            <span>{t('project.recent_tasks_title')}</span>
          </h2>

          {isLoading ? (
            <div className="text-center text-xs text-charcoal-subtle py-8">{t('common.loading')}</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-xs text-charcoal-subtle py-8 border border-dashed border-surface-border rounded-lg">
              {t('kanban.empty_filtered')}
            </div>
          ) : (
            <div className="divide-y divide-surface-border/60">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 cursor-pointer first:pt-0 last:pb-0 hover:bg-canvas/30 transition-colors rounded-lg px-2 -mx-2"
                >
                  {/* Task details */}
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-charcoal group-hover:text-ocean transition-colors truncate">
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-charcoal-subtle truncate mt-1 max-w-2xl">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Badges and metadata */}
                  <div className="flex items-center space-x-3.5 mt-2 sm:mt-0 shrink-0">
                    <div>{getPriorityBadge(task.priority)}</div>
                    <div>{getStatusBadge(task.status)}</div>
                    <div className="text-[11px] text-charcoal-subtle">
                      {task.dueDate ? (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-charcoal-subtle/70" />
                          <span>{new Date(task.dueDate).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US')}</span>
                        </span>
                      ) : (
                        <span className="text-charcoal-subtle/40">-</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-ocean"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task details modal dialog */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubtasksUpdated={fetchData}
        />
      )}
    </AppLayout>
  );
};
