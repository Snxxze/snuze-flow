# SnuzeFlow Frontend (React + TypeScript + Vite)

ส่วนต่อประสานผู้ใช้งานระบบ **SnuzeFlow** (SaaS Project Management & Kanban Workflow Platform) พัฒนาด้วยเทคโนโลยี React, TypeScript, Vite, Tailwind CSS v4 และ Radix UI

---

## ฟีเจอร์หลัก (Key Features)

- **ระบบจัดการโปรเจกต์ (Workspaces):** สร้าง เชิญสมาชิก และดูภาพรวมโครงการ
- **กระดานงานอัจฉริยะ (Kanban Board & Table View):** บอร์ดคาร์ดงานและตารางจัดการงานย่อ-ขยายตามความกว้างจอ
- **แดชบอร์ดงานรวม (Global Dashboard):** รวบรวมงานทั้งหมดที่ผู้ใช้รับผิดชอบข้ามโปรเจกต์
- **การจัดการสองภาษา (i18n):** รองรับการสลับภาษาไทย (TH) และภาษาอังกฤษ (EN) ทันที
- **ส่วนตั้งค่าระบบแบบ Sliding Pill:** ปรับเปลี่ยนค่าและเก็บข้อมูลถาวรผ่าน `localStorage`

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **UI Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (พร้อมปลั๊กอิน `@tailwindcss/vite`)
- **Base Components:** Radix UI (Dialog, Dropdown Menu, Select)
- **State Management & API Query:** `@tanstack/react-query` (Axios)
- **Localization:** `i18next` & `react-i18next`

---

## การติดตั้งเริ่มต้น (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables)
สร้างไฟล์ `.env.development` (สำหรับโหมดพัฒนา) หรือ `.env.production` (สำหรับโปรดักชัน) ในโฟลเดอร์ `frontend/`:

```ini
# โหมดจำลองข้อมูล (ตั้งเป็น false หากต้องการต่อหลังบ้านจริง)
VITE_USE_MOCK=true

# ที่อยู่โดเมนของหลังบ้าน (API Server)
VITE_API_BASE_URL=http://localhost:8080
```

### 3. รันระบบสำหรับพัฒนา (Dev Server)
```bash
npm run dev
```
แอปพลิเคชันจะพร้อมทำงานที่ URL `http://localhost:5173`

---

## แนวปฏิบัติการแปลภาษา (i18n & Localization)

เรามีกฎสำคัญและขั้นตอนตรวจสอบระบบแปลภาษาเพื่อคุณภาพของ UI เกรดโปรดักชัน:

1. **ห้าม Hardcode ข้อความผสมภาษา:** 
   หลีกเลี่ยงการฝังภาษาอังกฤษในวงเล็บลงไปในคีย์แปลภาษาไทย (เช่น `ชื่อโปรเจกต์ (Project Name)` ในไฟล์ภาษาไทย) ให้ตัดวงเล็บออกเหลือเพียงภาษาเดียว หากต้องการทำอภิธานศัพท์ให้แยกด้วย Component หรือแสดงผลผ่าน Tooltip แทน
2. **รันตัวลินต์ภาษาอัตโนมัติ (Locale Linter):**
   ก่อนส่งโค้ด (Push) หรือรัน CI pipeline ให้สั่งสแกนเช็คความถูกต้องของไฟล์แปลภาษาไทย:
   ```bash
   npm run lint:locales
   ```

---

## การบิลด์ระบบเพื่อใช้งานจริง (Production Build)

ตรวจสอบความถูกต้องของประเภทข้อมูลและคอมไพล์โค้ด:
```bash
npm run build
```
ผลลัพธ์จะถูกจัดเก็บลงโฟลเดอร์ `/dist` เพื่อเตรียมพร้อมไป Deploy บน Vercel หรือเซิร์ฟเวอร์ Static Hosting ทั่วไป
