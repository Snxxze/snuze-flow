# SnuzeFlow — Frontend Architecture Guidelines

ข้อกำหนดสถาปัตยกรรม การจัดโครงสร้างโฟลเดอร์ การจัดการ State และระบบ Route ฝั่ง Frontend

---

## 1. Feature-Driven Directory Structure

```text
src/
├── assets/                  # Static assets (images, icons)
├── components/              # Shared UI Components (Button, Modal, Input)
├── features/                # Feature Modules (auth, projects, tasks, dashboard)
├── hooks/                   # Shared Global Custom Hooks (useDebounce, useLocalStorage)
├── layouts/                 # Application Layouts (AppLayout, AuthLayout)
├── pages/                   # Pure View Orchestrators (<= 50 lines logic)
├── routes/                  # React Router Definitions & Auth Guards
├── services/                # API Client, Axios & Zod Response Fetchers
├── styles/                  # Global CSS, Design Tokens & Tailwind Config
└── types/                   # Shared TypeScript Interfaces / Generated API Types
```

* **Feature Isolation Rule**: ห้าม Import โค้ดข้าม Feature โดยตรง ให้ใช้ `src/components/`, `src/hooks/` หรือ `src/shared/` สำหรับสิ่งที่ใช้ร่วมกัน

---

## 2. State Management & Zod Response Validation

```text
[ Global Auth State ]  →  [ Server Cache State ]  →  [ Local UI State ]
(React Context)           (TanStack Query)           (useState / useReducer)
```

1. **Global Auth State**: เก็บ `user`, `token`, `isAuthenticated` ใน React Context (`AuthContext.tsx`)
2. **Server Cache State**: ใช้ **TanStack Query** (React Query) สำหรับดึงและแคชข้อมูลทั้งหมด
3. **Zod Validation at Service Layer**: ทุก API Response ต้องผ่าน Zod Schema Validation ตั้งแต่ชั้น Service Layer ก่อนคืนค่าให้ Hook/UI

```ts
// src/features/tasks/services/taskService.ts
export const getProjectTasks = async (projectId: string): Promise<TaskList> => {
  const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
  return taskListSchema.parse(response.data);
};
```

---

## 3. Routing & Strict Page Logic Rule

* **Route Guards**: `ProtectedRoute` (ตรวจสอบ JWT Token) และ `GuestOnlyRoute` (สำหรับ `/login`, `/register`)
* **Strict Page Logic Rule**: ไฟล์ Page Component (`src/pages/*.tsx`) ทำหน้าที่เป็นเพียง **View Orchestrator / Layout Assembler** เท่านั้น **ห้ามมี Business Logic เกิน 50 บรรทัด** ให้สกัด Logic ออกไปไว้ที่ Page Custom Hook (เช่น `useDashboardPage.ts`)
