# SnuzeFlow — Git Branching Strategy & Workflow Guidelines

เอกสารข้อกำหนดการบริหารจัดการ Git Branch, Workflow การพัฒนา และมาตรฐาน Commit Message สำหรับโครงการ SnuzeFlow

---

## 1. โครงสร้าง Git Branching Strategy

```text
main (Production)         ──────────────────────────────────► Deploy ขึ้น Vercel & Render (Prod)
                           ▲                      ▲
                           │ Pull Request (Merge) │
develop (Staging/Dev)    ──┴──────────────────────┴─────────► Branch รวมงานหลักประจำวัน
                           ▲                   ▲
                           │                   │
feature/xxx              ──┴── [Feature Dev] ──┘             ► Branch ย่อยสำหรับเขียนฟีเจอร์ใหม่
```

### รายละเอียดของแต่ละ Branch

| Branch | สภาพแวดล้อม (Environment) | สิทธิ์และการทำงาน |
|---|---|---|
| `main` | Production (Prod) | โค้ดที่เสถียร 100% สำหรับผู้ใช้จริง ห้าม Push ตรงๆ เด็ดขาด (ต้องผ่าน PR จาก `develop`) |
| `develop` | Staging / Development | Branch รวมโค้ดหลักสำหรับทีมพัฒนา ใช้ทดสอบระบบภาพรวมก่อนปล่อยขึ้น Prod |
| `feature/<name>` | Local Workspace | Branch แยกสกัดตามฟีเจอร์ (เช่น `feature/kanban-drag-drop`, `feature/landing-page`) |
| `hotfix/<name>` | Production Fix | Branch ด่วนจาก `main` สำหรับแก้ Bug วิกฤตบน Production แล้ว Merge กลับทั้ง `main` และ `develop` |

---

## 2. ขั้นตอนการทำงานประจำวัน (Step-by-Step Workflow)

### 2.1 เริ่มทำฟีเจอร์ใหม่ (Start New Feature)
```bash
# 1. ดึงโค้ดล่าสุดจาก develop
git checkout develop
git pull origin develop

# 2. แตก branch ใหม่ตามชื่อฟีเจอร์ที่จะทำ
git checkout -b feature/your-feature-name
```

### 2.2 บันทึกโค้ดและ Push ขึ้น GitHub (Commit & Push)
```bash
# 1. ตรวจสอบไฟล์ที่แก้ไข
git status

# 2. Stage และ Commit ด้วยสเปก Conventional Commits
git add .
git commit -m "feat: add task filtering by priority"

# 3. Push ขึ้น Remote Repository
git push -u origin feature/your-feature-name
```

### 2.3 การรวมโค้ด (Merge & Release)
1. เข้าสู่ GitHub -> เปิด Pull Request (PR) จาก `feature/your-feature-name` เข้าสู่ `develop`
2. เมื่อทดสอบบน `develop` ผ่านแล้ว: เปิด PR จาก `develop` เข้าสู่ `main` เพื่อปล่อย Deploy ขึ้น Production อัตโนมัติ

---

## 3. มาตรฐานการเขียน Commit Message (Conventional Commits)

ให้ใช้รูปแบบ `type: description` เพื่อความชัดเจนและง่ายต่อการย้อนดูประวัติ:

| Type | คำอธิบาย | ตัวอย่าง |
|---|---|---|
| `feat` | เพิ่มฟีเจอร์ใหม่ | `feat: add closed beta landing page with interactive sandbox` |
| `fix` | แก้ไข Bug | `fix: resolve auth token expiry redirection bug` |
| `refactor` | ปรับแต่งโครงสร้างโค้ดโดยไม่เปลี่ยนพฤติกรรม | `refactor: extract sandbox state hook into useSandboxState` |
| `docs` | แก้ไข/เพิ่ม เอกสารประกอบ | `docs: add git branching strategy and workflow rules` |
| `style` | ปรับแต่งเรื่อง Formatting/CSS | `style: update button hover status colors` |
| `chore` | งานจิปาถะ เช่น อัปเดต dependencies | `chore: update tailwind package dependencies` |

---

## 4. Rules & Safety Checklist

- [ ] ห้าม `git push --force` เข้า `main` หรือ `develop` เด็ดขาด
- [ ] ห้าม Commit ไฟล์ `.env` หรือ Secret Key ใดๆ ลงใน Git (ตรวจสอบ .gitignore เสมอ)
- [ ] ก่อนเปิด PR: ต้องรัน `npx tsc --noEmit` (Frontend) และ `go test ./...` (Backend) ในเครื่องให้ผ่าน 100% ก่อนเสมอ
