import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Project, ProjectInvitation } from '@/features/projects/types/project';
import { NotificationCenter } from './NotificationCenter';

interface AppLayoutProps {
  children: React.ReactNode;
  pendingInvitationsCount?: number;
  invitations?: ProjectInvitation[];
  onAcceptInvitation?: (id: string) => Promise<void>;
  onRejectInvitation?: (id: string) => Promise<void>;
  onRefreshNotifications?: () => void;
  recentProjects?: Project[];
  currentPageTitle?: string;
  onCreateProject?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  invitations,
  onAcceptInvitation,
  onRejectInvitation,
  onRefreshNotifications,
  recentProjects = [],
  currentPageTitle,
  onCreateProject,
}) => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const recentProjectItems = recentProjects.slice(0, 4).map((p, i) => ({
    id: p.id,
    name: p.name,
    updatedLabel: i === 0 ? 'ล่าสุด' : `${i + 1} วันที่แล้ว`,
  }));

  // Sidebar width: 240px when expanded, 64px (Slim Bar) when collapsed
  const sidebarWidth = isSidebarOpen ? 240 : 64;

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Section 1: ChatGPT-style Slim/Expanded Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        recentProjects={recentProjectItems}
        onCreateProject={onCreateProject}
      />

      {/* Section 2: Main Content Area (Smoothly shifts margin-left) */}
      <div
        className="flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Section 2a: Topbar (Fixed 48px, smoothly adjusts left offset) */}
        <header
          className="fixed top-0 right-0 z-40 h-12 border-b border-surface-border bg-canvas/90 backdrop-blur-md transition-[left] duration-300 ease-in-out"
          style={{ left: `${sidebarWidth}px` }}
        >
          <div className="flex h-full items-center justify-between px-6">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-charcoal-subtle">
              <span className="text-charcoal-subtle/60 font-medium">{t('layout.logo_text')}</span>
              {currentPageTitle && (
                <>
                  <span className="text-surface-border">/</span>
                  <span className="font-semibold text-charcoal">{currentPageTitle}</span>
                </>
              )}
            </div>

            {/* Right: Search Input + Notification Center Bell */}
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-subtle z-10" />
                <Input
                  type="text"
                  placeholder={t('layout.search_placeholder')}
                  className="bg-surface pl-9 w-48 text-xs h-8"
                />
              </div>

              <NotificationCenter
                invitations={invitations}
                onAcceptInvitation={onAcceptInvitation}
                onRejectInvitation={onRejectInvitation}
                onRefresh={onRefreshNotifications}
              />
            </div>
          </div>
        </header>

        {/* Section 2b: Main Scrollable Canvas (offset below Topbar 48px) */}
        <main className="flex-1 pt-12 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
