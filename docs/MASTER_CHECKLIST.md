# SnuzeFlow — Development Checklist 

---

## 1. Frontend & Design System Constraints
- [ ] **Color Palette (60-30-10 Rule)**:
  - 60% Canvas: `#fbfaf5` (Warm Cream White)
  - 30% Surface/Text: `#ffffff` (Cards), `#e5e3d7` (Border), `#333333` (Text Primary), `#666666` (Subtext)
  - 10% Accent: `#1489b4` (Ocean Teal)
- [ ] **Component Rules**: PascalCase filename & component, 1 file = 1 component, Named export เท่านั้น (`export const ...`), ห้าม Inline styles
- [ ] **Typography**: 2 Scales (Marketing vs UI Utility) ผ่าน `tailwind.config.ts`
- [ ] **Page Logic Limit**: หน้า `src/pages/*.tsx` **ห้ามมี Business Logic เกิน 50 บรรทัด** (สกัดออกไปไว้ที่ Page Custom Hook)
- [ ] **State & I/O**: Global Auth (React Context) $\rightarrow$ Server State (TanStack Query) $\rightarrow$ Zod Validation ที่ Service Layer
- [ ] **PWA & iOS**: `theme-color="#fbfaf5"`, `viewport-fit=cover`, Safe Area Inset CSS (`env(safe-area-inset-top)`), Apple touch icon Solid `#1489b4`

---

## 2. Backend Architecture Constraints (Go + Gin)
- [ ] **Interface Placement Rule**: "Accept interfaces, return structs" เปิดประกาศ Interface ที่ package ฝั่งคนเรียกใช้ (Consumer) เท่านั้น ห้ามเปิดใน `repository` package
- [ ] **3-Model Isolation**: 
  - `DTO` (`json`, `binding` tags)
  - `Domain Model` (Pure Go struct, **Zero tags**)
  - `DB Model` (`db` tags)
- [ ] **Response Envelope**: **ห้ามใส่ `success: true`** (ใช้ HTTP Status Code เป็น Truth), ใส่ `requestId` ในทุก response
- [ ] **Pagination Meta**: สเปก `{ data: [...], meta: { page, pageSize, total, totalPages }, requestId }`
- [ ] **Error Handling**: Custom `apperrors` และเรียกใช้ `response.Error(c, err)` แปลงเป็น HTTP Status Code 400, 401, 403, 404, 500 ในจุดเดียว
- [ ] **Logging Standard**: ใช้ **`log/slog`** (Go Stdlib) พิมพ์ JSON Log พร้อมพ่วง `request_id` (ห้ามใส่ Emoji หรือ `fmt.Printf` ลอยๆ ใน Backend Log)
- [ ] **Dependency Injection**: Explicit Manual Constructors (`New...`) เท่านั้น ห้ามใช้ Reflection DI Framework

---

## 3. Database & Performance Constraints (Neon Postgres)
- [ ] **Naming Conventions**: Table พหูพจน์ `snake_case`, Columns `snake_case`, Primary Key `UUID` (ชื่อ `id`), Foreign Keys `[table]_id`
- [ ] **Query Performance**: **ห้ามวนลูปยิง Query แบบ N+1** ให้ใช้ `LEFT JOIN` + `JSON_AGG` รวม Tasks + Subtasks ใน 1 Query
- [ ] **Mandatory Indexes**: สร้าง Index บน `project_id`, `user_id`, `task_id`, `due_date`, `status` ตั้งแต่วันแรก
- [ ] **Connection Pool**: `SetMaxOpenConns(10)`, `SetMaxIdleConns(5)`, `SetConnMaxLifetime(15m)`

---

## 4. API Contract Pipeline
- [ ] สั่งรัน `make gen-api` หรือ `npm run gen:api` (`swag init` $\rightarrow$ `openapi-typescript`) ทุกครั้งที่มีการแก้ DTO/Handler
