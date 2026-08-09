# 🛡️ SnuzeFlow MVP Phase 1 Verification Matrix

> เอกสารบันทึกสเปกและการตรวจสอบระบบ (Verification Matrix) ของ **SnuzeFlow MVP Phase 1**  
> ใช้ติดตามสถานะความสมบูรณ์ของฟีเจอร์และระดับการทดสอบแบบอัตโนมัติ (Testing Pyramid: Unit, Integration, E2E)

---

## 1. 🔑 Authentication & Identity Module

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **AUTH-01** | Register ผู้ใช้ใหม่ด้วย Email, Username, Display Name | ✅ `TestUserService_Register_Success` / `DuplicateConflict` | - | 🟢 Verified |
| **AUTH-02** | Login ด้วย Email + Password (เข้ารหัส bcrypt + ออก JWT) | ✅ `TestUserService_Login_Success` / `InvalidPassword` | `E2E-01` | 🟢 Verified |
| **AUTH-03** | Auth Session Check (`GET /api/auth/me`) | ✅ `TestUserService_GetMe_Success` | `E2E-01` | 🟢 Verified |
| **AUTH-04** | Notice ป้องกันการสมัครสาธารณะช่วง Closed Beta | - | Visual Check | 🟢 Verified |

---

## 2. 📁 Project & Workspace Module

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **PROJ-01** | Create Project (`POST /api/projects`) | ✅ Go Handler Unit | `E2E-02` | 🟢 Verified |
| **PROJ-02** | List Projects + Workspace Navigation | - | `E2E-02` | 🟢 Verified |
| **PROJ-03** | Calculate Stats (`completionRate`, `doneTasks`, `overdue`) | ✅ Go Service Unit | `E2E-02` | 🟢 Verified |
| **PROJ-04** | Owner Only: Delete Project (`DELETE /api/projects/:id`) | ✅ `TestProjectService_DeleteProject_OwnerSuccess` / `MemberForbidden` | `E2E-06` | 🟢 Verified |

---

## 3. 👥 Team & Authorization Module (Role Rules)

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **TEAM-01** | Owner Only: Send Invite (`POST /api/projects/:id/invitations`) | ✅ `TestProjectService_InviteMember_OnlyOwnerAllowed` | `E2E-06` | 🟢 Verified |
| **TEAM-02** | List Pending Invitations (`GET /api/invitations`) | - | `E2E-06` | 🟢 Verified |
| **TEAM-03** | Accept / Reject Invitation | - | `E2E-06` | 🟢 Verified |
| **TEAM-04** | **Role Authorization Matrix**: Owner (Full) vs Member (No Delete) | ✅ `TestProjectService_DeleteProject_MemberForbidden` | `E2E-06` | 🟢 Verified |

---

## 4. 📋 Task Management & Multi-View Module

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **TASK-01** | Create Task (`POST /api/projects/:id/tasks`) | ✅ `TestTaskService_CreateTask_Success` / `NonMemberForbidden` | `E2E-03` | 🟢 Verified |
| **TASK-02** | Update Status (`todo` / `in_progress` / `done`) | - | `E2E-03` | 🟢 Verified |
| **TASK-03** | Deadline Alert Logic (`overdue` vs `approaching` vs `normal`) | ✅ `TestDeadlineCalculation_Unit` | `E2E-04` | 🟢 Verified |
| **TASK-04** | Multi-View Modes (Board, List, Table) | Vitest Component Test | `E2E-03` | 🟢 Verified |
| **TASK-05** | Real-time Search, Priority & Assignee Filtering | ✅ `useTaskFilters.test.ts` (5 tests) | - | 🟢 Verified |

---

## 5. 🔘 Subtask Checklist & Progress Module

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **SUB-01** | Create Subtask (`POST /api/tasks/:id/subtasks`) | Go Handler Unit | `E2E-05` | 🟢 Verified |
| **SUB-02** | Toggle Status (`isCompleted`) + Recalculate Progress % | Go Handler Unit | `E2E-05` | 🟢 Verified |
| **SUB-03** | Inline Subtask Accordion (Lazy Load & Cache) | Frontend Component Test | `E2E-05` | 🟢 Verified |

---

## 6. 📊 Dashboard Aggregation Module

| ID | Requirement / Feature Scope | Unit Test | Critical E2E | Status |
|---|---|---|---|---|
| **DASH-01** | Personal Dashboard Tasks Sorted by Due Date | - | `E2E-07` | 🟢 Verified |
| **DASH-02** | 4 Metric Summary Cards (`Total`, `In Progress`, `Done`, `High Priority`) | - | `E2E-07` | 🟢 Verified |

---

## 7. 🚀 Critical E2E Verification Flows (Playwright)

| Flow ID | Scenario Description | Target Verification | Status |
|---|---|---|---|
| **E2E-01** | Login → Workspace Navigation | JWT session set, redirected to `/projects` | 🟢 E2E Passed |
| **E2E-02** | Create Project → Workspace Navigation | Project created in DB, opens detail workspace header | 🟢 E2E Passed |
| **E2E-03** | Create Task → Change Status → Refresh Page | Status persistence across refresh in Kanban | 🟢 E2E Passed |
| **E2E-04** | Overdue Deadline Alert Verification | Task with past due date renders Red badge on exact card | 🟢 E2E Passed |
| **E2E-05** | Create Subtasks → Complete Checklist | Completion rate % bar updates in real-time | 🟢 E2E Passed |
| **E2E-06** | Owner Invites Member → Accept → Role Check | Member gains access; restricted from Delete | 🟢 E2E Passed |
| **E2E-07** | Dashboard Aggregation Check | Tasks from all joined projects appear on Dashboard | 🟢 E2E Passed |

---

## Definition of Done for MVP Verification (DoD)

การ์ดงานและฟีเจอร์นับว่า **🟢 VERIFIED** เมื่อผ่านครบ 5 ด่าน:
1. **Implementation Code**: มีโค้ดสมบูรณ์และผ่านการตรวจ Static Types (`tsc`)
2. **Backend Unit & Integration Tests**: ผ่าน `go test ./...` (11/11 PASSED)
3. **Frontend Unit & Component Tests**: ผ่าน `vitest run` (5/5 PASSED)
4. **Critical E2E User Journey**: ผ่าน `playwright test` (8/8 PASSED)
5. **Manual UX Verification**: ตรวจสอบลำดับการใช้งานจริงและ visual restraint
