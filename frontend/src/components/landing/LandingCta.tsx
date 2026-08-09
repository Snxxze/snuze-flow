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
    <section className="border-t border-surface-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto max-w-xl">
        <h2 className="font-display font-semibold text-xl text-charcoal mb-2">
          มีบัญชีผู้ใช้งานแล้วหรือยัง?
        </h2>
        <p className="text-xs text-charcoal-subtle mb-6">
          เข้าสู่ระบบด้วยบัญชีที่ได้รับจัดสรรเพื่อเริ่มต้นจัดการโปรเจกต์ของคุณ
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link to="/projects">
              <Button size="sm" className="h-9 px-5 gap-1.5 text-xs">
                ไปยังพื้นที่ทำงาน<ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" className="h-9 px-5 gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                เข้าสู่ระบบ
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-surface-border bg-canvas px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-charcoal">
            <WaveLogo size={12} />
          </div>
          <span className="text-xs font-semibold text-charcoal">SnuzeFlow</span>
          <span className="text-[10px] text-charcoal-subtle/50">· Closed Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs text-charcoal-subtle hover:text-ocean transition-colors">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </footer>
  </>
);
