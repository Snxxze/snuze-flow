import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ShieldAlert, LogIn } from 'lucide-react';

export const RegisterPage: React.FC = () => {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-charcoal">
      <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface p-8 shadow-sm text-center">
        {/* Wave Logo */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-charcoal shadow-sm">
          <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 15C5 9 8 21 11 15C14 9 17 21 20 15C21.5 12 23.5 12 24 13"
              stroke="#1489b4"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-status-warning font-semibold text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>Closed Beta Phase</span>
        </div>

        <h1 className="mt-2 text-xl font-bold text-charcoal">ระบบยังไม่เปิดสมัครสาธารณะ</h1>
        
        <p className="mt-3 text-xs text-charcoal-subtle leading-relaxed">
          ขณะนี้ SnuzeFlow อยู่ในช่วงทดสอบแบบเฉพาะกลุ่ม บัญชีผู้ใช้งานจะได้รับจัดสรรโดยตรงจากทีมงานผู้พัฒนาเท่านั้น
        </p>

        <div className="mt-6 rounded-lg border border-surface-border bg-canvas p-4 text-left text-xs text-charcoal-subtle space-y-2">
          <p className="font-semibold text-charcoal">มีบัญชีที่ได้รับจัดสรรแล้ว?</p>
          <p className="text-[11px]">
            หากคุณได้รับ Username / Password จากทีมงานแล้ว สามารถกดปุ่มด้านล่างเพื่อเข้าสู่ระบบได้ทันที
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Link to="/login" className="block w-full">
            <Button className="w-full h-10 text-sm gap-2">
              <LogIn className="h-4 w-4" />
              ไปยังหน้าเข้าสู่ระบบ
            </Button>
          </Link>
          
          <Link to="/" className="block text-xs font-medium text-ocean hover:underline">
            ← กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};
