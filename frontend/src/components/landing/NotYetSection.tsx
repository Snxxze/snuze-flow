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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mx-auto max-w-2xl rounded border border-surface-border bg-surface p-6">
        <h3 className="font-display font-semibold text-lg text-charcoal mb-1">สิ่งที่ยังไม่มี (ตอนนี้)</h3>
        <p className="text-xs text-charcoal-subtle mb-4">
          เราบอกตรงๆ ว่าอะไรที่ยัง <em>ไม่</em> ทำ เพื่อไม่ให้คาดหวังผิดพลาด
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {NOT_YET_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded px-2.5 py-1.5 bg-canvas">
              <X className="h-3.5 w-3.5 shrink-0 text-charcoal-subtle/40" />
              <span className="text-xs text-charcoal-subtle">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-charcoal-subtle/70">
          ฟีเจอร์เหล่านี้อยู่ใน Roadmap Phase 2+ ถ้าสนใจช่วยให้ Feedback ได้เลย
        </p>
      </div>
    </div>
  </section>
);
