# 🎨 SnuzeFlow — UX/UI Design Specification & API Handover Document

> **สำหรับทีม UX/UI Designer และ Product Team**  
> เอกสารฉบับนี้รวบรวมขอบเขตระบบ (Feature Boundaries), โครงสร้างข้อมูลจริงจาก API (API Data Contracts), ข้อจำกัดทางสถาปัตยกรรม (Design Constraints) และกฎดีไซน์ซิสเต็ม (Design Tokens) สำหรับนำไปออกแบบ UI และสร้าง Wireframe/Figma ของระบบ **SnuzeFlow**

---

## 1. 📌 ภาพรวมผลิตภัณฑ์ (Product Mission & Value Proposition)

**SnuzeFlow** คือเว็บแอปพลิเคชันบริหารจัดการโปรเจกต์และติดตามการ์ดงาน (SaaS Project Management & Kanban Workflow Platform) ที่มุ่งเน้น:
* **ความรวดเร็วและกระชับ (Speed & High Density):** เห็นข้อมูลสำคัญ (Glanceable Data) ได้ทันทีโดยไม่ต้องคลิกหลายรอบ
* **ความสะอาดสบายตา (Clean & Modern Aesthetic):** ใช้อิทธิพลดีไซน์สไตล์ **Linear, Notion, Slack**
* **ความตรงไปตรงมาของ UI:** ไม่ใส่ประดับตกแต่งเกินความจำเป็น (Zero-Clutter) เน้นพื้นที่ทำงาน (Workspace-First Layout)

---

## 2. 🖥️ จอภาพเป้าหมายและสเกลความกว้าง (Target Devices & Viewports)

| ประเภทอุปกรณ์ | ความกว้างหน้าจอ (Viewport Width) | พฤติกรรมของเลย์เอาต์ (Layout Behavior) |
|---|---|---|
| **Notebook 1080p (Scaling 125%)** | **`1536px`** *(ความกว้างอ้างอิงหลัก)* | **Full-Width App Layout** ขยายเต็มหน้าจอ ไม่เหลือขอบว่างสีขาวเกินจำเป็น |
| **Desktop Full HD / 2K** | `1920px` - `2560px` | ตาราง Kanban Board ขยายการ์ดเป็น 3–5 คอลัมน์กว้างสบายตา |
| **Tablet / Small Laptop** | `768px` - `1024px` | สลับการวางคอลัมน์เป็น 2 คอลัมน์ หรือแนวตั้ง |
| **Mobile Screen** | `< 768px` | รวมคอลัมน์เป็นแท็บสลับดูทีละคอลัมน์ |

---

## 3. 📐 โครงสร้างแอปพลิเคชันหลัก (App Shell Structure)

```
+-------------------------------------------------------------------------------------------------+
| SIDEBAR (ซ้าย)                       | TOPBAR (สูง 48px พอดีเป๊ะ)                                  |
| Width: 240px (Expanded)              | - ลิงก์ย้อนกลับ / ชื่อหน้าปัจจุบัน                          |
| Width: 64px  (Collapsed Icons)       | - Badge แจ้งเตือนคำเชิญทีม (เด้งสีส้ม)                      |
|                                      | - โปรไฟล์ผู้ใช้ (@username) & ปุ่ม ออกจากระบบ             |
| - โลโก้ & ชื่อ SnuzeFlow              +---------------------------------------------------------+
| - เมนู: Dashboard, Projects          | MAIN WORKSPACE CANVAS (Full-Width px-6 sm:px-8 lg:px-10) |
| - ปุ่มพับเก็บ Sidebar (Collapse)     | 1. Project Summary Widget (แดชบอร์ดสรุปสถิติตัวเลข 6 ช่อง) |
|                                      | 2. Search & Multi-Filter Toolbar                        |
|                                      | 3. Interactive Kanban Board (3 Columns: Todo, InProgress, Done) |
+--------------------------------------+----------------------------------------------------------+
```

* **Sidebar (เมนูด้านซ้าย):**
  * สภาวะกางออก (`240px`): แสดงชื่อโปรเจกต์และเมนูนำทางหลัก
  * สภาวะพับเก็บ (`64px`): ย่อเหลือเฉพาะไอคอนเพื่อเพิ่มพื้นที่ทำงานบนจอ
* **Topbar (เมนูด้านบน):**
  * **ความสูงฟิกซ์เด็ดขาด:** **`48px` (`h-12`)** ประหยัดพื้นที่แนวตั้ง (Vertical Real Estate)
  * **ดีไซน์ Glassmorphism:** พื้นหลังสีขาวโปร่งแสง 95% พร้อมเบลอฉากหลัง (`bg-surface/95 backdrop-blur`)

---

## 4. 🎨 ระบบสีและสไตล์การออกแบบ (Design System & Color Tokens)

### กฎการใช้สี 60-30-10 (Color Tokens)
* **60% Primary Canvas Background:** `#fbfaf5` (สีขาวนวล Off-white สบายตา ไม่จ้าเท่า `#ffffff`)
* **30% Secondary Surface & Cards:** `#ffffff` (สีขาวสะอาด สำหรับพื้นหลังการ์ดงาน, ป๊อปอัพ และตาราง)
* **10% Accent Brand Color:** `#1489b4` (สีฟ้า Ocean Blue สำหรับปุ่มกดหลัก, ลิงก์, และสถานะโฟกัส)

### สีสถานะและการแจ้งเตือน (Status & Alert Colors)
* **Done / Complete (สำเร็จแล้ว):** `#10b981` (Emerald Green)
* **Warning ($\le 3$ วันถึงกำหนดส่ง):** `#d97706` (Amber Orange)
* **Overdue (เกินกำหนด) / High Priority (ด่วน):** `#e11d48` (Rose Red)
* **Low / Medium Priority:** `#64748b` (Slate Gray) / `#1489b4` (Ocean Blue)

### มาตรฐานขอบมน (Corner Radius Token)
* **บังคับใช้ `rounded-md` (6px) ตรงกันทั้งระบบ 100%** สำหรับ ปุ่มกด (Buttons), ช่องกรอกข้อมูล (Inputs), การ์ดงาน (Cards), และกล่องป๊อปอัพ (Modals)
* **ยกเว้น `rounded-full`** ใช้เฉพาะ รูปอวตารผู้ใช้ (Avatars) และ Badge สถานะวงกลมเท่านั้น

### ลำดับขนาดฟอนต์ (Typography Hierarchy)
* **Page Title:** `24px` (`text-2xl font-bold`)
* **Section Title:** `16px` (`text-base font-bold`)
* **Card Title / Button Text:** `14px` (`text-sm font-semibold`)
* **Body / Subtext:** `12px` (`text-xs text-charcoal-subtle`)
* **Badges / Metadata Captions:** `10px - 11px` (`text-[10px]` / `text-[11px]`)

---

## 5. 🔌 ขอบเขตระบบและสเปกข้อมูลจาก API (Feature Boundary & API Data Contracts)

ทีม UX/UI **ต้องออกแบบ UI ให้สอดคล้องกับตัวแปรที่ API ส่งกลับมาและรองรับเท่านั้น** เพื่อป้องกันไม่ให้ออกแบบฟีเจอร์ที่ไม่มีในระบบหลังบ้าน:

### 5.1 ระบบสมาชิกและยืนยันตัวตน (Auth Module)
* **API Endpoints:**
  * `POST /api/auth/register` (สมัครสมาชิก: `email`, `username`, `displayName`, `password`)
  * `POST /api/auth/login` (เข้าสู่ระบบ: `email`, `password`)
  * `GET /api/auth/me` (ดึงข้อมูลผู้ใช้ปัจจุบัน)
* **ตัวแปรที่มีให้ใช้งานใน UI:**
  * `id` (UUID string)
  * `email` (string)
  * `username` (string เช่น `@johndoe`)
  * `displayName` (string เช่น `John Doe`)
* **ข้อจำกัด:** *ไม่มีข้อมูลรูปภาพโปรไฟล์จากโซเชียล หรือเบอร์โทรศัพท์ (UI ให้แสดงอวตารอักษรแรกของชื่อ เช่น "J")*

---

### 5.2 ระบบโปรเจกต์และคำเชิญทีม (Project & Invitation Module)
* **API Endpoints:**
  * `POST /api/projects` (สร้างโปรเจกต์: `name`, `description`)
  * `GET /api/projects` (ดึงรายการโปรเจกต์ที่ผู้ใช้เป็นสมาชิก)
  * `GET /api/projects/:id` (ดึงรายละเอียดโปรเจกต์ + รายชื่อสมาชิก)
  * `GET /api/projects/:id/stats` (ดึงสถิติตัวเลขสรุปผลโปรเจกต์)
  * `POST /api/projects/:id/invitations` (ส่งคำเชิญเข้าร่วมทีมด้วย Email - **Owner Only**)
  * `GET /api/invitations` (ดึงรายการคำเชิญที่ค้างอยู่ของผู้ใช้)
  * `POST /api/invitations/:id/accept` & `/reject` (ตอบรับ / ปฏิเสธคำเชิญ)

* **ตัวแปรสถิติใน `GET /api/projects/:id/stats` (สำหรับนำไปวาดภาพสรุป):**
  1. `totalTasks` (จำนวนงานทั้งหมด)
  2. `todoTasks` (งานที่ต้องทำ)
  3. `inProgressTasks` (งานที่กำลังทำ)
  4. `doneTasks` (งานที่เสร็จแล้ว)
  5. `overdueTasks` (งานที่เกินกำหนดส่ง)
  6. `totalMembers` (จำนวนสมาชิกในทีม)
  7. `completionRate` (เปอร์เซ็นต์ความคืบหน้า 0–100%)

* **สิทธิ์ผู้ใช้ (Role Boundaries):**
  * `Owner` (เจ้าของโปรเจกต์): เห็นปุ่ม **"+ เชิญสมาชิก"** และปุ่มลบโปรเจกต์
  * `Member` (สมาชิก): **ซ่อนปุ่ม "+ เชิญสมาชิก"** (เห็นเฉพาะรายชื่อสมาชิก)

---

### 5.3 ระบบการ์ดงานและ Kanban Board (Task Module)
* **API Endpoints:**
  * `POST /api/projects/:id/tasks` (สร้างการ์ดงาน)
  * `GET /api/projects/:id/tasks` (ดึงการ์ดงานทั้งหมดในโปรเจกต์)
  * `PATCH /api/tasks/:id/status` (ย้ายสถานะการ์ดงาน)
  * `DELETE /api/tasks/:id` (ลบการ์ดงาน)

* **ตัวแปรของการ์ดงาน (Task Fields):**
  * `id` (UUID)
  * `title` (ชื่อการ์ดงาน)
  * `description` (รายละเอียดงาน)
  * `status` (ล็อค 3 ค่าเท่านั้น: `todo`, `in_progress`, `done`)
  * `priority` (ล็อค 3 ค่าเท่านั้น: `low`, `medium`, `high`)
  * `dueDate` (วันกำหนดส่ง RFC3339 string หรือ null)
  * `assignee` (วัตถุผู้รับผิดชอบ: `id`, `email`, `username`, `displayName` หรือ null)

---

### 5.4 ระบบรายการย่อยและติดตามความคืบหน้า (Subtasks Module)
* **API Endpoints:**
  * `POST /api/tasks/:id/subtasks` (เพิ่มรายการย่อย: `title`)
  * `GET /api/tasks/:id/subtasks` (ดึงรายการย่อยของการ์ดงาน)
  * `PATCH /api/subtasks/:id/status` (สลับสถานะติ๊กถูก: `isCompleted: boolean`)
  * `DELETE /api/subtasks/:id` (ลบรายการย่อย)

* **การแสดงผลบน UI:**
  * **บนการ์ด Kanban Board:** แสดงแถบหลอดความคืบหน้า % + ตัวเลขสรุป (เช่น `2/3 รายการ 66%`)
  * **ภายใน Modal รายละเอียด:** แสดงรายการย่อยแบบ Checklist ติ๊กถูก (`[ ]` / `[x]`) พร้อมช่องพิมพ์เพิ่มรายการย่อยแบบ Inline

---

## 6. 📱 รายละเอียด UX/UI ของแต่ละหน้าจอหลัก (Screen-by-Screen Specifications)

### 6.1 หน้าเข้าสู่ระบบ & สมัครสมาชิก (Auth Pages: `/login`, `/register`)
* **โครงสร้าง:** การ์ดเข้าสู่ระบบตั้งตรงกลางจอ (`max-w-md`) ขอบมน `rounded-md`
* **องค์ประกอบ:**
  * โลโก้แบรนด์ "S" บนพื้นหลังสีฟ้า `bg-ocean`
  * ฟอร์มกรอกข้อมูลพร้อม Label ชัดเจนภาษาไทย (`อีเมล`, `รหัสผ่าน`, `ชื่อที่ใช้แสดง`)
  * ปุ่มกดหลักสีฟ้ากว้างเต็มความกว้าง (`w-full rounded-md bg-ocean`)
  * สวิตช์สลับหน้า "สมัครสมาชิกที่นี่" / "เข้าสู่ระบบที่นี่"

---

### 6.2 หน้าโปรเจกต์ทั้งหมด (Project List Page: `/`)
* **โครงสร้าง:** Full-Width App Layout (`w-full px-6 sm:px-8 lg:px-10`)
* **องค์ประกอบ:**
  1. **Invitation Banner (แถบคำเชิญทีม):** แสดงด้านบนสุดหากมีคำเชิญเข้ามา การ์ดสีส้มอ่อน `rounded-md` พร้อมปุ่ม "ตอบรับ" (เขียว) และ "ปฏิเสธ" (ขาว)
  2. **Page Header:** หัวข้อ "โปรเจกต์ทั้งหมด" + ปุ่มหลัก `+ สร้างโปรเจกต์ใหม่`
  3. **Project Grid Cards (4 คอลัมน์บนจอใหญ่ `xl:grid-cols-4`):**
     * ชื่อโปรเจกต์ (Hover เปลี่ยนเป็นสีฟ้า `hover:text-ocean`)
     * Badge แสดงสิทธิ์ผู้ใช้: `Owner` (สีฟ้า) / `Member` (สีเทา)
     * รายละเอียดโปรเจกต์สังเขป (ตัดบรรทัด `line-clamp-2`)
     * วันที่สร้าง + ปุ่มทางลัด `เข้าสู่โปรเจกต์ →`
  4. **Create Project Modal:** ป๊อปอัพฟอร์มสร้างโปรเจกต์

---

### 6.3 หน้ารายละเอียดโปรเจกต์ & Kanban Board (Project Detail Page: `/projects/:id`)
* **โครงสร้าง:** Full-Width App Layout
* **องค์ประกอบ:**
  1. **Workspace Header:**
     * ปุ่มย้อนกลับ `←` + ชื่อโปรเจกต์ + Badge สิทธิ์ `Owner`
     * ปุ่มแอ็กชัน: `+ เชิญสมาชิก` (แสดงเฉพาะ Owner) และ `+ สร้างการ์ดงาน (New Task)`
  2. **Project Summary Analytics Widget (แดชบอร์ดสรุปผล 6 ช่อง):**
     * แถบหลอด % ความคืบหน้าภาพรวม (Completion Rate)
     * การ์ดสรุปตัวเลข 6 มิติ: `งานทั้งหมด`, `ต้องทำ`, `กำลังทำ`, `เสร็จสิ้น`, `เกินกำหนด (Overdue)`, `สมาชิกในทีม`
  3. **Search & Multi-Filter Toolbar (แถบค้นหาและกรองข้อมูล):**
     * ช่องค้นหาค้นความ (Search Input) พร้อมไอคอนแว่นขยาย
     * Dropdown กรองระดับความสำคัญ (Priority Filter: ทั้งหมด, High, Medium, Low)
     * Dropdown กรองผู้รับผิดชอบ (Assignee Filter)
  4. **Interactive Kanban Board (3 คอลัมน์):**
     * **คอลัมน์ 1: To Do (ต้องทำ)** — แถบสีเทา
     * **คอลัมน์ 2: In Progress (กำลังทำ)** — แถบสีฟ้า
     * **คอลัมน์ 3: Done (เสร็จสิ้น)** — แถบสีเขียว
     * **Task Card Item:**
       * ชื่อการ์ดงาน (Hover สีฟ้า + คลิกเปิด Modal รายละเอียด)
       * Priority Badge (High: แดง, Medium: ส้ม, Low: เทา)
       * Due Date Alert Badge (เกินกำหนด: แดงพร้อมรูปเตือน, เหลือ $\le 3$ วัน: ส้ม)
       * Subtasks Progress Bar (แสดง % ความคืบหน้างานย่อย)
       * Assignee Avatar (อวตารอักษรแรก)
       * ปุ่มย้ายสถานะการ์ดด่วน (`← Move`, `Move →`)

---

### 6.4 ป๊อปอัพรายละเอียดงาน & Checklist (Task Detail Modal)
* **องค์ประกอบ:**
  1. **Modal Header:** Badge Priority + ชื่อการ์ดงาน + ปุ่มปิด `X`
  2. **Task Metadata Grid:** ผู้รับผิดชอบ + วันกำหนดส่ง
  3. **Description Box:** รายละเอียดงานเต็ม
  4. **Subtask Checklist Section:**
     * แถบ Progress Bar ความคืบหน้า (%)
     * ช่องพิมพ์เพิ่มรายการย่อยแบบ Inline (`+ เพิ่มรายการย่อยใหม่...`)
     * รายการย่อยแบบ Checklist ติ๊กถูก (`[x]` ขีดฆ่าข้อความ / `[ ]` ปกติ)
     * ปุ่มลบรายการย่อย (`Trash` icon)

---

## 7. ⚠️ การจัดการสถานะ UI และข้อผิดพลาด (UI States & Edge Cases)

นักออกแบบต้องเตรียมหน้าจอรองรับ 4 สถานะหลักของระบบ:

| สถานะ (State) | ตัวอย่างสถานะบนหน้าจอ (UI Representation) |
|---|---|
| **Loading State** | แสดง Skeleton Screen หรือข้อความ *"กำลังโหลดข้อมูล..."* ระหว่างรอ API |
| **Empty State** | เมื่อตารางไม่มีข้อมูล ให้แสดงรูปกล่องว่าง + ข้อความแนะนำ *"ยังไม่มีการ์ดงาน กดสร้างการ์ดแรกเลย"* |
| **Success State** | แสดง Toast Banner สีเขียว *"สร้างการ์ดงานสำเร็จ"* หรือ *"ส่งคำเชิญสำเร็จ"* |
| **Error / Alert State** | แสดง Error Banner สีแดง เมื่อเกิดข้อผิดพลาด เช่น *"ไม่พบอีเมลผู้ใช้ในระบบ"* (404) หรือ *"คำเชิญถูกใช้งานไปแล้ว"* (409) |

---

## 8. 📁 สรุปไฟล์ซอร์สโค้ดอ้างอิงของระบบ

ทีม UX/UI และนักพัฒนาสามารถดูซอร์สโค้ดและโครงสร้างตัวแปรภาษา Go / TypeScript ได้ที่:
* **UI Components:** [frontend/src/components/](file:///d:/Dowload%20Google/snuze-flow/frontend/src/components/)
* **UI Pages:** [frontend/src/pages/](file:///d:/Dowload%20Google/snuze-flow/frontend/src/pages/)
* **TypeScript Types & Zod Schemas:** [frontend/src/features/](file:///d:/Dowload%20Google/snuze-flow/frontend/src/features/)
* **Backend API DTO Schemas:** [backend/internal/dto/](file:///d:/Dowload%20Google/snuze-flow/backend/internal/dto/)
