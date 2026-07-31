import React from 'react';
import { CheckSquare, Calendar, Users, Zap, Github } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

// FeatureCard is a private sub-component of FeatureSection — not exported
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className="group flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean/10 text-ocean group-hover:bg-ocean group-hover:text-white transition-all duration-200">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-[15px] text-charcoal mb-1">{title}</h3>
      <p className="text-[13px] text-charcoal-subtle leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FEATURES: FeatureCardProps[] = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Kanban Board แบบเรียบง่าย',
    desc: '3 สถานะ: ต้องทำ / กำลังทำ / เสร็จสิ้น ย้ายการ์ดงานและติดตามความคืบหน้าได้ทันที',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'แจ้งเตือน Deadline อัตโนมัติ',
    desc: 'ระบบไฮไลต์งานที่เลยกำหนดส่ง (แดง) และงานที่ใกล้ครบกำหนด (เหลือง) โดยอัตโนมัติ',
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    title: 'Subtask Checklist',
    desc: 'แบ่งงานใหญ่เป็นรายการย่อย พร้อมแถบแสดงความคืบหน้าแบบ Real-time',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'ทีมขนาดเล็ก',
    desc: 'เชิญสมาชิกด้วย Email หรือ Username กำหนดสิทธิ์ Owner / Member ได้ชัดเจน',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Dashboard รวมทุกงาน',
    desc: 'เห็น Task จากทุก Project เรียงตาม Due Date — รู้ทันทีว่าวันนี้ต้องทำอะไรก่อน',
  },
  {
    icon: <Github className="h-5 w-5" />,
    title: 'Honest & Transparent',
    desc: 'ระบบยังพัฒนาอยู่ เราโปร่งใสเรื่องข้อจำกัด ไม่สัญญาสิ่งที่ยังทำไม่ได้',
  },
];

export const FeatureSection: React.FC = () => (
  <section className="border-t border-surface-border bg-surface">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="font-display font-bold text-[28px] text-charcoal mb-3">ทำได้อะไรบ้าง (ในตอนนี้)</h2>
        <p className="text-sm text-charcoal-subtle">MVP Phase 1 — ฟีเจอร์พื้นฐานที่ใช้ได้จริง ไม่มีของฟุ่มเฟือย</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
        ))}
      </div>
    </div>
  </section>
);
