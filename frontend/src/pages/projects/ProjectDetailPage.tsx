import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { projectService } from '@/features/projects/services/projectService';
import { Project, ProjectStats } from '@/features/projects/types/project';
import { taskService } from '@/features/tasks/services/taskService';
import { CreateTaskPayload, Task } from '@/features/tasks/types/task';
import {
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  User,
  Plus,
  LayoutGrid,
  List,
  Table,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const ProjectDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'table' | 'members'>('board');
  const [isLoading, setIsLoading] = useState(true);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      const [projData, taskData, statsData, allProjects] = await Promise.all([
        projectService.getProjectDetail(id),
        taskService.listTasks(id),
        projectService.getProjectStats(id),
        projectService.listProjects(),
      ]);
      setProject(projData);
      setTasks(taskData);
      setStats(statsData);
      setProjects(allProjects);
    } catch (err: any) {
      console.error('Failed to load project details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    if (!id) return;
    await taskService.createTask(id, payload);
    await fetchProjectData();
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    await taskService.updateTaskStatus(taskId, { status: newStatus });
    await fetchProjectData();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm(t('task.confirm_delete'))) {
      await taskService.deleteTask(taskId);
      await fetchProjectData();
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setInviteError(null);
    setInviteSuccess(null);
    setIsSubmitting(true);

    try {
      await projectService.inviteMember(id, { email: inviteEmail });
      setInviteSuccess(t('project.invite_success', { email: inviteEmail }));
      setInviteEmail('');
      await fetchProjectData();
    } catch (err: any) {
      setInviteError(err?.response?.data?.error?.message || t('project.invite_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout currentPageTitle={t('common.loading')} recentProjects={recentProjects}>
        <div className="flex h-64 items-center justify-center text-xs text-charcoal-subtle">
          {t('common.loading')}
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout currentPageTitle={t('project.not_found')} recentProjects={recentProjects}>
        <div className="w-full px-6 py-12 text-center sm:px-8 lg:px-10">
          <h2 className="font-display font-semibold text-xl text-charcoal">{t('project.not_found')}</h2>
          <p className="mt-1 text-sm text-charcoal-subtle">{t('project.not_found_desc')}</p>
          <Link to="/projects" className="mt-4 inline-block text-sm font-medium text-ocean hover:underline">
            {t('project.back_to_list')}
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isOwner = project.role === 'owner';
  const memberCount = project.members?.length || 0;

  // Compact progress bar width
  const progressWidth = stats ? `${stats.completionRate}%` : '0%';

  const taskViewTabs = [
    { id: 'board' as const, label: t('kanban.view_board'), icon: LayoutGrid },
    { id: 'list' as const, label: t('kanban.view_list'), icon: List },
    { id: 'table' as const, label: t('kanban.view_table'), icon: Table },
  ];

  return (
    <AppLayout currentPageTitle={project.name} recentProjects={recentProjects}>
      <main className="w-full px-6 py-6 sm:px-8 lg:px-10">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-5">
          {/* Back + title + role + actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/projects"
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded text-charcoal-subtle hover:text-charcoal hover:bg-canvas transition-colors"
                title="กลับ"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-charcoal truncate">{project.name}</h1>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ocean shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      {t('project.role_owner')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-subtle truncate">
                  {project.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>
            </div>

            {/* Primary actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInviteError(null);
                    setInviteSuccess(null);
                    setShowInviteModal(true);
                  }}
                  className="gap-1.5 h-8 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {t('project.invite_btn')}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowTaskModal(true)}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('task.action_new_task')}
              </Button>
            </div>
          </div>

          {/* Compact inline stats */}
          {stats && (
            <div className="mt-3 ml-10 flex items-center gap-3">
              <p className="text-xs text-charcoal-subtle">
                <span className="font-medium text-charcoal">{stats.totalTasks}</span> งาน
                <span className="mx-1.5 text-charcoal-subtle/40">·</span>
                <span className="font-medium text-charcoal">{stats.doneTasks}</span> เสร็จ
                {stats.overdueTasks > 0 && (
                  <>
                    <span className="mx-1.5 text-charcoal-subtle/40">·</span>
                    <span className="font-medium text-status-danger">{stats.overdueTasks} เกินกำหนด</span>
                  </>
                )}
                <span className="mx-1.5 text-charcoal-subtle/40">·</span>
                <span className="font-medium text-charcoal">{stats.completionRate}%</span>
              </p>
              {/* Slim progress bar */}
              <div className="w-20 h-1 rounded-full bg-surface-border overflow-hidden shrink-0">
                <div
                  className="h-full bg-status-done transition-all duration-500"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Tabs ───────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between border-b border-surface-border">
          {/* Task view tabs */}
          <div className="flex items-center">
            {taskViewTabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tabId
                    ? 'border-ocean text-ocean'
                    : 'border-transparent text-charcoal-subtle hover:text-charcoal'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Members — separated to the right */}
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors mb-[-1px] ${
              activeTab === 'members'
                ? 'border-ocean text-ocean'
                : 'border-transparent text-charcoal-subtle hover:text-charcoal'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            {t('project.members_section_title', { count: memberCount })}
          </button>
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        {activeTab === 'members' ? (
          <div className="divide-y divide-surface-border/60">
            <div className="pb-3">
              <h2 className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wide">
                {t('project.members_section_title', { count: memberCount })}
              </h2>
            </div>
            {project.members?.map((member) => (
              <div key={member.userId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas border border-surface-border text-xs font-semibold text-charcoal">
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-charcoal">{member.displayName}</div>
                    <div className="text-[10px] text-charcoal-subtle">
                      @{member.username} · {member.email}
                    </div>
                  </div>
                </div>

                <div>
                  {member.role === 'owner' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ocean">
                      <ShieldCheck className="h-3 w-3" />
                      {t('project.role_owner')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-charcoal-subtle">
                      <User className="h-3 w-3" />
                      {t('project.role_member')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            members={project.members || []}
            viewMode={activeTab}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onSelectTask={(task) => setSelectedTask(task)}
            onSubtasksUpdated={() => fetchProjectData()}
          />
        )}

        {/* ── Modals ────────────────────────────────────────────────────── */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSubtasksUpdated={() => fetchProjectData()}
          />
        )}

        {showTaskModal && (
          <CreateTaskModal
            members={project.members || []}
            onClose={() => setShowTaskModal(false)}
            onSubmit={handleCreateTask}
          />
        )}

        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('project.dialog_invite_title')}</DialogTitle>
              <DialogDescription>
                {t('project.dialog_invite_sub')} {project.name}
              </DialogDescription>
            </DialogHeader>

            {inviteSuccess && (
              <div className="rounded-md bg-status-done/10 p-3 text-xs font-medium text-status-done border border-status-done/20">
                {inviteSuccess}
              </div>
            )}
            {inviteError && (
              <div className="rounded-md bg-status-danger/10 p-3 text-xs font-medium text-status-danger border border-status-danger/20">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  {t('project.invite_email_label')}
                </label>
                <Input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('project.invite_email_placeholder')}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                  {t('common.close')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('project.inviting') : t('project.invite_btn')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};
