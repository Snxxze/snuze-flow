import React from 'react';
import { X } from 'lucide-react';

const NOT_YET_ITEMS: string[] = [
  'Drag & Drop บน Kanban',
  'Comment / Activity Log',
  'Push Notification',
  'Email Reminder',
  'Time Tracking',
  'File Attachment',
  'Label / Tag ระบบ',
  'Fine-grained Permissions',
];

export const NotYetSection: React.FC = () => (
  <section className="border-t border-surface-border bg-canvas">
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-surface-border bg-surface p-8">
        <h3 className="font-display font-bold text-[20px] text-charcoal mb-2">สิ่งที่ยังไม่มี (ตอนนี้)</h3>
        <p className="text-sm text-charcoal-subtle mb-5">
          เราบอกตรงๆ ว่าอะไรที่ยัง <em>ไม่</em> ทำ เพื่อไม่ให้คาดหวังผิดพลาด
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {NOT_YET_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-canvas">
              <X className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle/40" />
              <span className="text-[13px] text-charcoal-subtle">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[12px] text-charcoal-subtle/70">
          ฟีเจอร์เหล่านี้อยู่ใน Roadmap Phase 2+ ถ้าสนใจช่วยให้ Feedback ได้เลย
        </p>
      </div>
    </div>
  </section>
);
