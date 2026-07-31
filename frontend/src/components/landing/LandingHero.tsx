import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, KeyRound } from 'lucide-react';
import { KanbanSandbox } from '@/components/landing/KanbanSandbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LandingHeroProps {
  isAuthenticated: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ isAuthenticated }) => {
  const [showAccessModal, setShowAccessModal] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
      <div className="text-center mb-10">
        {/* Closed Beta Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3.5 py-1.5 text-xs font-medium text-charcoal-subtle shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-status-warning animate-pulse" />
          ระบบอยู่ในช่วง Closed Beta — บัญชีผู้ใช้จะได้รับจัดสรรจากทีมงานโดยตรง
        </div>

        <h1 className="font-display font-bold text-[40px] sm:text-[52px] leading-tight text-charcoal mb-4">
          Task board สำหรับ<br />
          <span className="text-ocean">ทีมเล็กที่ทำงานจริง</span>
        </h1>

        <p className="mx-auto max-w-xl text-[15px] text-charcoal-subtle leading-relaxed mb-8">
          ติดตามงาน แบ่งหน้าที่ และรู้ว่าอะไรด่วนแค่ไหน — ไม่ต้องจ่ายค่า Tool แพงๆ
          <br className="hidden sm:block" />
          ลองเล่น Sandbox ด้านล่างก่อนเข้าใช้งานระบบจริง
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link to="/projects">
              <Button className="h-10 px-6 text-sm gap-2">
                ไปยังพื้นที่ทำงาน<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button className="h-10 px-6 text-sm gap-2">
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ (มีบัญชีแล้ว)
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowAccessModal(true)}
                className="h-10 px-6 text-sm gap-2"
              >
                <KeyRound className="h-4 w-4 text-ocean" />
                วิธีขอสิทธิ์ทดลองใช้
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-[11px] text-charcoal-subtle/60">
          * ระบบไม่อนุญาตให้สมัครสมาชิกเองสาธารณะในช่วงทดสอบนี้
        </p>
      </div>

      {/* Interactive Sandbox */}
      <KanbanSandbox />

      {/* Request Access Info Modal */}
      <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>การขอสิทธิ์เข้าใช้งานช่วง Closed Beta</DialogTitle>
            <DialogDescription>
              ขณะนี้ระบบ SnuzeFlow เปิดให้ทดสอบแบบเฉพาะกลุ่ม (Invite-Only)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs text-charcoal-subtle">
            <p>
              หากคุณต้องการทดลองใช้งานสำหรับตนเองหรือทีมขนาดเล็ก สามารถติดต่อขอรับ Username และ Password สำหรับเข้าใช้งานได้จากทีมงานโดยตรง
            </p>
            <div className="rounded-lg border border-surface-border bg-canvas p-3 text-charcoal font-mono text-[11px]">
              📌 ช่องทางติดต่อทีมพัฒนา:<br />
              Email: dev@snuzeflow.local (หรือติดต่อ Admin ประจำทีมของคุณ)
            </div>
            <p className="text-[11px] text-charcoal-subtle/70">
              เมื่อได้รับบัญชีแล้ว สามารถกดปุ่ม &quot;เข้าสู่ระบบ&quot; เพื่อเริ่มต้นใช้งานได้ทันที
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
