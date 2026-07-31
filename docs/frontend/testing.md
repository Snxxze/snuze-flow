# SnuzeFlow — Frontend Testing Guidelines

ข้อกำหนดและแนวทางการเขียน Automated Tests ฝั่ง Frontend (Unit, Integration, E2E)

---

## 1. Testing Pyramid & Tooling Setup

* **Unit Testing**: **Vitest** สำหรับ Pure Functions, Utilities และ Zod Schemas
* **Integration Testing**: **React Testing Library (RTL)** + **MSW (Mock Service Worker)** สำหรับทดสอบพฤติกรรม UI ร่วมกับ Hooks และ Mock Network Layer
* **E2E Testing**: **Playwright** สำหรับทดสอบ Critical User Flows บน Browser จริง

---

## 2. Testing Guidelines & Commands

* **Accessibility & User-centric Queries**: ค้นหา DOM Elements ด้วย `getByRole('button', { name: /save/i })` ห้าม ค้นหาด้วย Class Name หรือ Internal Component State
* **Test Commands**:
  ```bash
  npm run test        # รัน Unit & Integration Tests
  npm run test:e2e    # รัน Playwright E2E Tests
  ```
