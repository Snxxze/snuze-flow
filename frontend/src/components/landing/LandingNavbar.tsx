import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LogIn } from 'lucide-react';
import { WaveLogo } from '@/components/landing/WaveLogo';
import { Button } from '@/components/ui/button';

interface LandingNavbarProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isAuthenticated, isLoading }) => (
  <header className="sticky top-0 z-50 h-12 border-b border-surface-border bg-canvas/90 backdrop-blur-md">
    <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-charcoal shadow-xs">
          <WaveLogo size={18} />
        </div>
        <span className="text-sm font-bold text-charcoal tracking-tight">SnuzeFlow</span>
        <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-semibold text-ocean">Closed Beta</span>
      </div>

      {/* Auth-aware CTA */}
      <div className="flex items-center gap-2">
        {isLoading ? null : isAuthenticated ? (
          <Link to="/projects">
            <Button size="sm" className="h-7 text-xs gap-1.5">
              พื้นที่ทำงาน<ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="sm" className="h-7 text-xs gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              เข้าสู่ระบบ
            </Button>
          </Link>
        )}
      </div>
    </div>
  </header>
);
