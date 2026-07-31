# SnuzeFlow — Design System & Tokens

เอกสารกำหนดมาตรฐานงานออกแบบ UI/UX สี ตัวอักษร ระยะห่าง มาตรฐาน Component และ PWA Tokens สำหรับ **SnuzeFlow**

---

## 1. Color System (กฎ 60-30-10 Rule - Custom Ocean & Cream Palette)

```text
┌─────────────────────────────────────────────────────────┐
│  60% Dominant (Page Canvas: #fbfaf5 Warm Off-White)     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  30% Secondary (Text/Surface: #333333 / #ffffff)  │  │
│  │  ┌─────────────────┐                              │  │
│  │  │ 10% Accent      │                              │  │
│  │  │ (#1489b4 Ocean) │                              │  │
│  │  └─────────────────┘                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

* **60% Dominant (Canvas)**: `#fbfaf5` (`Warm Cream White`) — พื้นหลังเพจหลัก สบายตา
* **30% Secondary (Surface & Text)**:
  * Surface Card/Sidebar: `#ffffff`
  * Surface Border: `#e5e3d7`
  * Text Primary: `#333333` (`Dark Charcoal`)
  * Text Secondary: `#666666`
* **10% Accent (Call-to-Action)**: `#1489b4` (`Ocean Teal Blue`) — ปุ่ม Primary Action, Active Tabs, Focus Rings
* **Status Micro-Accents**:
  * Success / Done: `#0d9488` (Teal Green)
  * Warning ($\le$ 3 วัน): `#d97706` (Warm Amber)
  * Danger / Overdue: `#e11d48` (Rose Red)

---

## 2. Typography Scale (2 ชุด)

ใช้ **Inter** หรือ **Outfit** เป็น Font Family หลักสำหรับทั้งสองชุด

### 2.1 Marketing Scale (หน้า Landing Page / Hero Section)
* **H1 Hero**: `40px` / `text-4xl font-semibold leading-tight` (หรือ `text-hero`)
* **H2 Section**: `28px` / `text-3xl font-semibold leading-snug` (หรือ `text-section`)
* **H3 Card Title**: `18px` / `text-lg font-medium leading-snug`
* **Body Marketing**: `16px` / `text-base leading-relaxed`

### 2.2 UI/Utility Scale (หน้า Dashboard / Form / Table / Filter)
* **H1 (Page Title)**: `24px` / `text-2xl font-bold`
* **H2 (Section)**: `20px` / `text-xl font-semibold`
* **H3 (Card Title)**: `16px` / `text-base font-medium`
* **Body Primary**: `14px` / `text-sm`
* **Caption / Subtext**: `12px` / `text-xs`

---

## 3. Component Standards

1. **PascalCase Naming**: ชื่อ Component และชื่อไฟล์ต้องเป็น **PascalCase** เท่านั้น เช่น `TaskCard.tsx`
2. **1 File = 1 Component**: แต่ละไฟล์ Export หลักเพียง 1 Component
3. **Named Export Only**: ใช้ `export const TaskCard = ...` (ห้ามใช้ `export default`)
4. **No Inline Styles**: ใช้ Tailwind Utility Classes เท่านั้น

---

## 4. PWA & iOS Integration Tokens

```html
<!-- index.html -->
<meta name="theme-color" content="#fbfaf5" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

* **iOS App Icon**: 180×180px โดยใช้ Solid Accent Background `#1489b4`
* **Safe Area CSS**: `padding-top: env(safe-area-inset-top);` และ `padding-bottom: env(safe-area-inset-bottom);`
