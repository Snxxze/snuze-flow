import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/features/auth/context/AuthContext';
import { SettingsModal } from './SettingsModal';
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  recentProjects?: { id: string; name: string; updatedLabel: string }[];
  onCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  recentProjects = [],
  onCreateProject,
}) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/projects', icon: FolderKanban, label: t('project.list_title') },
    { to: '/dashboard', icon: LayoutDashboard, label: t('project.summary_title') },
  ];

  const isItemActive = (itemTo: string) => {
    if (itemTo === '/projects') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }
    return location.pathname === itemTo;
  };

  return (
    <>
      <nav
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col bg-canvas border-r border-surface-border text-charcoal transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[240px]' : 'w-16'
        }`}
      >
        {/* Section 1: Top Logo / ChatGPT Hover Morphing Toggle */}
        <div
          className={`flex items-center py-4 mb-2 h-14 shrink-0 transition-all duration-300 ${
            isOpen ? 'justify-between px-3.5' : 'justify-center px-0'
          }`}
        >
          {isOpen ? (
            /* Expanded State: Logo + Brand Name on left, PanelLeftClose on right */
            <>
              <Link to="/projects" className="flex items-center gap-2.5 overflow-hidden">
                <svg className="shrink-0" width="24" height="24" viewBox="0 0 26 26" fill="none">
                  <path
                    d="M2 15C5 9 8 21 11 15C14 9 17 21 20 15C21.5 12 23.5 12 24 13"
                    stroke="#1489b4"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="font-display font-bold text-lg tracking-tight text-charcoal whitespace-nowrap select-none">
                  {t('layout.logo_text')}
                </span>
              </Link>

              <button
                onClick={onToggle}
                className="p-1.5 rounded-md text-charcoal-subtle hover:text-charcoal hover:bg-surface-border/40 transition-colors shrink-0"
                title="ย่อ Sidebar"
              >
                <PanelLeftClose className="h-4 w-4 shrink-0" />
              </button>
            </>
          ) : (
            /* Collapsed State: Single Logo morphs to PanelLeftOpen Toggle on Hover (ChatGPT style) */
            <button
              onClick={onToggle}
              className="group relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-border/40 transition-colors shrink-0"
              title="กาง Sidebar ออก"
            >
              <span className="group-hover:hidden flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                  <path
                    d="M2 15C5 9 8 21 11 15C14 9 17 21 20 15C21.5 12 23.5 12 24 13"
                    stroke="#1489b4"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="hidden group-hover:flex items-center justify-center text-ocean">
                <PanelLeftOpen className="h-4 w-4 shrink-0" />
              </span>
            </button>
          )}
        </div>

        {/* Section 2: Create Project CTA Button */}
        {onCreateProject && (
          <div className={`mb-3 shrink-0 transition-all duration-300 ${isOpen ? 'px-3' : 'px-0 flex justify-center'}`}>
            <button
              onClick={onCreateProject}
              className={`flex items-center rounded-md text-sm text-charcoal transition-all duration-300 ease-in-out group hover:bg-surface ${
                isOpen ? 'w-full py-2 px-2.5' : 'h-9 w-9 justify-center p-0'
              }`}
              title={t('project.create_btn')}
            >
              <div className={`flex items-center overflow-hidden ${isOpen ? 'gap-3' : 'gap-0 justify-center w-full'}`}>
                <Plus className="h-[18px] w-[18px] shrink-0 text-charcoal-subtle group-hover:text-ocean transition-colors" />

                <span
                  className={`font-medium text-charcoal group-hover:text-ocean transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
                  }`}
                >
                  {t('project.create_btn')}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Section 3: Primary Navigation Links (Minimal Clean Active & Hover State) */}
        <div className={`space-y-1 mb-4 shrink-0 transition-all duration-300 ${isOpen ? 'px-3' : 'px-0 flex flex-col items-center'}`}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isItemActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center py-2 text-sm transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen
                    ? 'gap-3 px-2.5 rounded-md w-full'
                    : 'gap-0 h-9 w-9 justify-center rounded-md px-0'
                } ${
                  active
                    ? 'bg-surface-border/60 text-charcoal font-semibold'
                    : 'text-charcoal-subtle hover:bg-surface-border/40 hover:text-charcoal'
                }`}
                title={!isOpen ? label : undefined}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-ocean' : ''}`} />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Section 4: Recent Projects Rail (Timeline & Flexible Spacer) */}
        <div className={`flex-1 min-h-0 overflow-y-auto pt-2 transition-all duration-300 ${isOpen ? 'px-3' : 'px-0'}`}>
          {recentProjects.length > 0 && (
            <div className="border-t border-surface-border/60 pt-2">
              <p
                className={`text-[10px] font-semibold uppercase tracking-widest text-charcoal-subtle/70 px-1 mb-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-100 max-h-6' : 'opacity-0 max-h-0 mb-0'
                }`}
              >
                {t('layout.recent_projects')}
              </p>

              {isOpen ? (
                /* Expanded Rail Timeline */
                <div className="relative pl-5 transition-all duration-300 ease-in-out">
                  <svg
                    className="absolute left-[7px] top-0"
                    width="2"
                    style={{ height: 'calc(100% - 8px)' }}
                    fill="none"
                  >
                    <line
                      x1="1" y1="0" x2="1" y2="100%"
                      stroke="#e5e3d7"
                      strokeWidth="2"
                      strokeDasharray="2 4"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="space-y-1">
                    {recentProjects.map((p, i) => (
                      <Link
                        key={p.id}
                        to={`/projects/${p.id}`}
                        className="relative flex flex-col group p-1.5 rounded-md hover:bg-surface-border/40 transition-colors"
                      >
                        <span className={`rail-dot ${i === 0 ? 'active' : ''} absolute -left-[16px] top-2.5`} />
                        <span className="text-xs font-medium text-charcoal group-hover:text-ocean transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-data text-charcoal-subtle/70 mt-0.5">
                          {p.updatedLabel}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                /* Collapsed Icons for Recent Projects */
                <div className="flex flex-col items-center space-y-3 transition-all duration-300 ease-in-out">
                  {recentProjects.slice(0, 3).map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className={`h-7 w-7 shrink-0 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        i === 0
                          ? 'bg-surface-border/80 text-ocean'
                          : 'text-charcoal-subtle hover:text-charcoal hover:bg-surface-border/40'
                      }`}
                      title={p.name}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5: User Profile Dropdown Menu (Sticky Bottom) */}
        <div className={`mt-auto pb-3 shrink-0 transition-all duration-300 ${isOpen ? 'px-3 pt-3 border-t border-surface-border' : 'px-0 flex justify-center pt-2 border-t border-surface-border/40'}`}>
          <div className="flex items-center justify-between w-full">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className={`flex items-center rounded-md hover:bg-surface-border/40 transition-colors cursor-pointer group overflow-hidden flex-1 ${
                  isOpen ? 'gap-2.5 px-2 py-1.5' : 'h-9 w-9 justify-center p-0'
                }`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/20 text-xs font-bold text-ocean">
                    {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  {isOpen && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-charcoal truncate">{user?.displayName}</p>
                      <p className="text-[10px] text-charcoal-subtle truncate">@{user?.username}</p>
                    </div>
                  )}
                </div>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[200px] rounded-md border border-surface-border bg-surface p-1 shadow-md animate-in fade-in-0 zoom-in-98 duration-100 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2"
                  sideOffset={8}
                  align={isOpen ? "start" : "center"}
                >
                  {/* User Info Header */}
                  <div className="px-2.5 py-2 text-xs">
                    <p className="font-bold text-charcoal">{user?.displayName}</p>
                    <p className="text-[10px] text-charcoal-subtle truncate">@{user?.username}</p>
                  </div>
                  
                  <DropdownMenu.Separator className="h-px bg-surface-border/60 my-1" />

                  {/* Settings Item */}
                  <DropdownMenu.Item
                    onSelect={() => setShowSettings(true)}
                    className="flex items-center space-x-2 rounded px-2.5 py-2 text-xs font-semibold text-charcoal hover:bg-canvas hover:text-ocean cursor-pointer outline-none transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-charcoal-subtle group-hover:text-ocean" />
                    <span>{i18n.language === 'th' ? 'ตั้งค่าระบบ' : 'Settings'}</span>
                  </DropdownMenu.Item>

                  {/* Show Log Out in dropdown only if Sidebar is collapsed */}
                  {!isOpen && (
                    <>
                      <DropdownMenu.Separator className="h-px bg-surface-border/60 my-1" />
                      <DropdownMenu.Item
                        onSelect={handleLogout}
                        className="flex items-center space-x-2 rounded px-2.5 py-2 text-xs font-semibold text-status-danger hover:bg-status-danger/10 cursor-pointer outline-none transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t('layout.logout')}</span>
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Quick Log Out button (only shown when Sidebar is expanded) */}
            {isOpen && (
              <button
                onClick={handleLogout}
                title={t('layout.logout')}
                className="p-2 ml-1 rounded-md text-charcoal-subtle hover:text-status-danger hover:bg-status-danger/10 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};
