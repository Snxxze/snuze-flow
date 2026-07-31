import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { WaveLogo } from '@/components/landing/WaveLogo';
import { Button } from '@/components/ui/button';

interface LandingCtaProps {
  isAuthenticated: boolean;
}

export const LandingCta: React.FC<LandingCtaProps> = ({ isAuthenticated }) => (
  <>
    {/* Closing CTA Section */}
    <section className="border-t border-surface-border bg-gradient-to-r from-ocean to-ocean-hover">
      <div className="relative overflow-hidden">
        {/* Background Wave Decoration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 800 200"
          aria-hidden="true"
        >
          <path d="M0 140 C 100 80, 200 180, 300 120 S 500 60, 600 130 S 750 90, 800 130" stroke="#ffffff" strokeWidth="2" fill="none" />
          <path d="M0 170 C 120 110, 220 190, 340 150 S 520 100, 650 160 S 780 120, 800 150" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-display font-bold text-[32px] text-white mb-3">
            มีบัญชีผู้ใช้งานแล้วหรือยัง?
          </h2>
          <p className="text-white/75 text-[15px] mb-8 max-w-md mx-auto">
            เข้าสู่ระบบด้วย Credentials ที่ได้รับจัดสรรเพื่อเริ่มต้นจัดการโปรเจกต์ของคุณ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/projects">
                <Button className="h-11 px-8 bg-white text-ocean hover:bg-canvas font-semibold shadow-xs gap-2">
                  ไปยังพื้นที่ทำงาน<ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="h-11 px-8 bg-white text-ocean hover:bg-canvas font-semibold shadow-xs gap-2">
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ (Sign In)
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-surface-border bg-canvas px-6 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-charcoal shadow-xs">
            <WaveLogo size={14} />
          </div>
          <span className="text-xs font-semibold text-charcoal">SnuzeFlow</span>
          <span className="text-[10px] text-charcoal-subtle/60">Closed Beta · Invite Only</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[12px] text-charcoal-subtle hover:text-ocean transition-colors">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </footer>
  </>
);
