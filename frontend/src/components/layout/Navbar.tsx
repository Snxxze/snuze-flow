import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { FolderKanban, LogOut, Bell } from 'lucide-react';

interface NavbarProps {
  pendingInvitationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ pendingInvitationsCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-surface-border bg-surface/95 backdrop-blur">
      <div className="flex h-full w-full items-center justify-between px-6 sm:px-8 lg:px-10">
        
        {/* Section 1: Logo & Brand Identity */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ocean font-bold text-white text-xs shadow-xs">
            S
          </div>
          <span className="text-base font-bold text-charcoal tracking-tight">SnuzeFlow</span>
        </Link>

        {/* Section 2: Navigation Links & Invitation Notifications */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-charcoal transition-colors hover:bg-canvas"
          >
            <FolderKanban className="h-3.5 w-3.5 text-ocean" />
            <span>โปรเจกต์ทั้งหมด</span>
          </Link>

          {pendingInvitationsCount > 0 && (
            <span className="inline-flex items-center space-x-1 rounded-full bg-status-warning/10 px-2 py-0.5 text-[11px] font-medium text-status-warning border border-status-warning/20">
              <Bell className="h-3 w-3 animate-bounce" />
              <span>มี {pendingInvitationsCount} คำเชิญ</span>
            </span>
          )}

          {/* Section 3: User Profile Info & Sign Out Action */}
          <div className="flex items-center space-x-3 border-l border-surface-border pl-3 sm:pl-4">
            <div className="text-right">
              <div className="text-xs font-medium text-charcoal leading-tight">{user?.displayName}</div>
              <div className="text-[10px] text-charcoal-subtle leading-tight">@{user?.username}</div>
            </div>

            <button
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="flex items-center space-x-1 rounded-md px-2 py-1 text-xs text-charcoal-subtle transition-colors hover:bg-status-danger/10 hover:text-status-danger"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
