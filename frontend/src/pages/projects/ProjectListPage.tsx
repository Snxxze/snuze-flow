import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { projectService } from '@/features/projects/services/projectService';
import { Project, ProjectInvitation } from '@/features/projects/types/project';
import { FolderKanban, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FilterChip = 'all' | 'owner' | 'member';

export const ProjectListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projData = await projectService.listProjects();
      setProjects(projData);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }

    try {
      const invData = await projectService.listPendingInvitations();
      setInvitations(invData);
    } catch (err) {
      console.error('Failed to load pending invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await projectService.createProject({ name, description });
      setName('');
      setDescription('');
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(t('project.create_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInv = async (id: string) => {
    await projectService.acceptInvitation(id);
    await fetchData();
  };

  const handleRejectInv = async (id: string) => {
    await projectService.rejectInvitation(id);
    await fetchData();
  };

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.role === activeFilter;
  });

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <AppLayout
      invitations={invitations}
      onAcceptInvitation={handleAcceptInv}
      onRejectInvitation={handleRejectInv}
      onRefreshNotifications={fetchData}
      recentProjects={recentProjects}
      currentPageTitle={t('project.list_title')}
      onCreateProject={() => setShowModal(true)}
    >
      <div className="px-6 py-7 sm:px-8 lg:px-10">

        {/* Section 1: Hero Banner */}
        <div className="relative mb-10 overflow-hidden rounded bg-gradient-to-r from-ocean to-ocean-hover px-8 py-9 shadow-xs">
          {/* Background wave decoration */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 800 200"
          >
            <path
              d="M0 140 C 100 80, 200 180, 300 120 S 500 60, 600 130 S 750 90, 800 130"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0 170 C 120 110, 220 190, 340 150 S 520 100, 650 160 S 780 120, 800 150"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display font-semibold text-[28px] text-white leading-tight">
                {t('project.hero_title')}
              </h1>
              <p className="text-white/80 text-sm mt-1.5 max-w-md">
                {t('project.hero_sub')}
              </p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="shrink-0 bg-white text-ocean hover:bg-canvas font-semibold shadow-xs"
            >
              {t('project.hero_btn')}
            </Button>
          </div>
        </div>

        {/* Section 2: Recent Projects (งานล่าสุด) */}
        {recentProjects.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[18px] text-charcoal">{t('project.recent_tasks_title')}</h2>
              <Button
                variant="link"
                onClick={() => setActiveFilter('all')}
                className="text-sm font-semibold text-ocean p-0 h-auto"
              >
                {t('common.view_all')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.slice(0, 2).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group flex items-start gap-4 rounded border border-surface-border bg-surface p-5 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-11 w-11 shrink-0 rounded bg-ocean/10 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-ocean" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[15px] text-charcoal group-hover:text-ocean transition-colors truncate">
                        {p.name}
                      </h3>
                      {p.role === 'owner' ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-pill bg-ocean/10 px-2 py-0.5 text-[11px] font-semibold text-ocean">
                          <ShieldCheck className="h-3 w-3" />
                          {t('project.role_owner_tag')}
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-pill bg-canvas px-2 py-0.5 text-[11px] font-semibold text-charcoal-subtle border border-surface-border">
                          <User className="h-3 w-3" />
                          {t('project.role_member_tag')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-subtle mt-1 mb-3">
                      {new Date(p.createdAt).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {/* Wave Progress Bar */}
                    <div className="wave-track">
                      <div className="wave-fill" style={{ width: `${p.completionRate ?? 0}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: All Projects with Chip Filters */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <h2 className="font-display font-semibold text-[18px] text-charcoal">{t('project.all_projects_title')}</h2>

            {/* Chip Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all' as FilterChip, label: t('common.all') },
                { id: 'owner' as FilterChip, label: t('project.role_owner_tag') },
                { id: 'member' as FilterChip, label: t('project.role_member_tag') },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`chip ${activeFilter === id ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-charcoal-subtle">
              {t('project.loading')}
            </div>

          ) : filteredProjects.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded border border-dashed border-surface-border bg-surface p-12 text-center">
              <FolderKanban className="h-10 w-10 text-charcoal-subtle/40 mb-3" />
              <h3 className="font-semibold text-charcoal">{t('project.empty_title')}</h3>
              <p className="mt-1 text-sm text-charcoal-subtle max-w-xs">
                {t('project.no_projects_desc')}
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="mt-5"
              >
                {t('project.create_btn')}
              </Button>
            </div>

          ) : (
            /* Project Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group flex flex-col rounded border border-surface-border bg-surface p-5 hover:shadow-md transition-all duration-200"
                >
                  {/* Card Header: Name + Role Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <h3 className="font-semibold text-[15px] text-charcoal group-hover:text-ocean transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    {p.role === 'owner' ? (
                      <span className="shrink-0 rounded-pill bg-ocean/10 text-ocean px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                        {t('project.role_owner_tag')}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-pill bg-canvas text-charcoal-subtle border border-surface-border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                        {t('project.role_member_tag')}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-charcoal-subtle line-clamp-2 mb-3 flex-1">
                    {p.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>

                  {/* Wave Progress Bar */}
                  <div className="wave-track mb-3">
                    <div className="wave-fill" style={{ width: `${p.completionRate ?? 0}%` }} />
                  </div>

                  {/* Card Footer: Date + Enter Link */}
                  <div className="mt-auto border-t border-surface-border pt-3.5 flex items-center justify-between">
                    <span className="font-data text-[11px] text-charcoal-subtle">
                      {new Date(p.createdAt).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ocean group-hover:gap-1.5 transition-all">
                      {t('project.enter_project')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('project.dialog_create_title')}</DialogTitle>
              <DialogDescription>{t('project.dialog_create_sub')}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">{t('project.name_label')}</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('project.name_placeholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">{t('project.desc_label')}</label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('project.desc_placeholder')}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('project.creating') : t('project.create_btn')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};
