import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ProjectSummaryWidget } from '@/components/projects/ProjectSummaryWidget';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { projectService } from '@/features/projects/services/projectService';
import { Project, ProjectStats } from '@/features/projects/types/project';
import { taskService } from '@/features/tasks/services/taskService';
import { CreateTaskPayload, Task } from '@/features/tasks/types/task';
import { ArrowLeft, UserPlus, ShieldCheck, User, Plus, Kanban, Users } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'kanban' | 'members'>('kanban');
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

  return (
    <AppLayout currentPageTitle={project.name} recentProjects={recentProjects}>
      <main className="w-full px-6 py-8 sm:px-8 lg:px-10">
        {/* Section 1: Workspace Header & Action Buttons */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3">
            <Link
              to="/projects"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-border bg-surface text-charcoal-subtle transition-colors hover:text-charcoal shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-charcoal">{project.name}</h1>
                {isOwner && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-ocean/10 px-2.5 py-0.5 text-xs font-semibold text-ocean">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{t('project.role_owner')}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-subtle">{project.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => {
                  setInviteError(null);
                  setInviteSuccess(null);
                  setShowInviteModal(true);
                }}
                className="gap-1.5"
              >
                <UserPlus className="h-4 w-4 text-ocean" />
                <span>{t('project.invite_btn')}</span>
              </Button>
            )}

            <Button
              onClick={() => setShowTaskModal(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{t('task.action_new_task')}</span>
            </Button>
          </div>
        </div>

        {/* Section 2: Project Summary Analytics Widget */}
        {stats && <ProjectSummaryWidget stats={stats} />}

        {/* Section 3: Navigation Tabs (Kanban Board / Team Members) */}
        <div className="mb-6 flex space-x-2 border-b border-surface-border">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'kanban'
                ? 'border-ocean text-ocean'
                : 'border-transparent text-charcoal-subtle hover:text-charcoal'
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>{t('kanban.view_board')} ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'members'
                ? 'border-ocean text-ocean'
                : 'border-transparent text-charcoal-subtle hover:text-charcoal'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{t('project.members_section_title', { count: project.members?.length || 0 })}</span>
          </button>
        </div>

        {/* Section 4: Active Tab Content */}
        {activeTab === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            members={project.members || []}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        ) : (
          <div className="rounded-md border border-surface-border bg-surface p-6 shadow-sm">
            <h2 className="text-base font-bold text-charcoal">
              {t('project.members_section_title', { count: project.members?.length || 0 })}
            </h2>
            <div className="mt-4 divide-y divide-surface-border/50">
              {project.members?.map((member) => (
                <div key={member.userId} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas border border-surface-border text-xs font-bold text-charcoal">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-charcoal">{member.displayName}</div>
                      <div className="text-[10px] text-charcoal-subtle">
                        @{member.username} • {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {member.role === 'owner' ? (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-ocean/10 px-2.5 py-0.5 text-xs font-medium text-ocean">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{t('project.role_owner')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-charcoal-subtle border border-surface-border">
                        <User className="h-3 w-3" />
                        <span>{t('project.role_member')}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Modals (Task Detail / Create Task / Invite Member) */}
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
              <div className="mt-3 rounded-md bg-status-done/10 p-3 text-xs font-medium text-status-done border border-status-done/20">
                {inviteSuccess}
              </div>
            )}
            {inviteError && (
              <div className="mt-3 rounded-md bg-status-danger/10 p-3 text-xs font-medium text-status-danger border border-status-danger/20">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">{t('project.invite_email_label')}</label>
                <Input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('project.invite_email_placeholder')}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  {t('common.close')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
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
