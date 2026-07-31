import { SandboxTask } from '@/components/landing/types';

export const MOCK_LANDING_TASKS: SandboxTask[] = [
  {
    id: 't1',
    title: 'ออกแบบหน้า Login ให้ตรงตาม Design Spec',
    status: 'todo',
    priority: 'high',
    dueLabel: 'เกินกำหนด 2 วัน',
    dueStatus: 'overdue',
    subtasks: [
      { id: 's1', title: 'สร้าง Form component', completed: true },
      { id: 's2', title: 'เชื่อม AuthContext', completed: false },
      { id: 's3', title: 'ทดสอบ Validation', completed: false },
    ],
    assigneeInitials: 'KS',
    assigneeColor: '#1489b4',
  },
  {
    id: 't2',
    title: 'ตรวจสอบ JWT Middleware ฝั่ง Backend',
    status: 'in_progress',
    priority: 'medium',
    dueLabel: 'เหลือ 2 วัน',
    dueStatus: 'warning',
    subtasks: [
      { id: 's4', title: 'ตรวจสอบ Token Expiry', completed: true },
      { id: 's5', title: 'ทดสอบ Rate Limit', completed: false },
    ],
    assigneeInitials: 'AT',
    assigneeColor: '#0d9488',
  },
  {
    id: 't3',
    title: 'Deploy ขึ้น Render และ Vercel',
    status: 'done',
    priority: 'low',
    dueLabel: 'เสร็จแล้ว',
    dueStatus: 'done',
    subtasks: [
      { id: 's6', title: 'ตั้งค่า Environment Variables', completed: true },
      { id: 's7', title: 'ทดสอบ CORS Production', completed: true },
    ],
    assigneeInitials: 'PA',
    assigneeColor: '#d97706',
  },
];
