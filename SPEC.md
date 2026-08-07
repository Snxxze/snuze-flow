# SnuzeFlow — Project Spec

Personal project management web app. ใช้ส่วนตัวและ collaborate กับคนอื่นในทีมเล็กได้

---

## MVP Scope

### In (Phase 1)
- Auth: register / login (email + password, JWT)
- Project: CRUD, กำหนดสี
- Member: invite ด้วย email, 2 roles (Owner / Member)
- Task: CRUD พร้อม status, priority, due date, assignee
- Subtask: CRUD ใต้ task — **1 ระดับเท่านั้น ไม่มี sub-subtask**
- Dashboard: รวม task ทุก project เรียงตาม due date
- Deadline warning: color-coded (≤3 วัน = เหลือง, เลยกำหนด = แดง, Done = ไม่แสดง)

### Out (Phase 2+)
- Kanban board (drag & drop)
- Label / Tag
- Comment / Activity log
- Push notification / Email reminder
- Time tracking
- File attachment
- Fine-grained permissions

---

## Business Rules

| Rule | รายละเอียด |
|---|---|
| BR-01 | ลบ project ได้เฉพาะ Owner |
| BR-02 | Member ถูกลบออก → หมดสิทธิ์เข้าถึงทันที |
| BR-03 | Subtask จำกัด 1 ระดับ |
| BR-04 | Task ที่ `status = done` ไม่นับใน deadline warning |
| BR-05 | Assignee ต้องเป็น member ของ project นั้น |
| BR-06 | JWT token อายุ 24 ชั่วโมง |
| BR-07 | Email unique ในระบบ |

---



## Architecture

```
[ Browser ]
     │ HTTPS
     ▼
[ Frontend: Vite + React ]  → Vercel
     │ REST API / HTTPS
     ▼
[ Backend: Go + Gin ]       → Render (Docker)
     └── PostgreSQL          → Neon
```

---

## Database Schema

### `users`
| column | type | note |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE NOT NULL | |
| username | VARCHAR UNIQUE NOT NULL | สำหรับค้นหาเชิญเข้า project |
| password_hash | VARCHAR NOT NULL | bcrypt |
| display_name | VARCHAR NOT NULL | |
| created_at | TIMESTAMPTZ | |

### `projects`
| column | type | note |
|---|---|---|
| id | UUID PK | |
| owner_id | UUID FK → users.id | |
| name | VARCHAR NOT NULL | |
| description | TEXT | |
| color | VARCHAR(7) | hex เช่น `#6366F1` |
| created_at | TIMESTAMPTZ | |

### `project_members`
| column | type | note |
|---|---|---|
| project_id | UUID FK → projects.id | PK composite |
| user_id | UUID FK → users.id | PK composite |
| role | VARCHAR | `owner` / `member` |
| joined_at | TIMESTAMPTZ | |

### `project_invitations`
| column | type | note |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects.id | |
| invited_user_id | UUID FK → users.id | ผู้ถูกเชิญ |
| status | VARCHAR | `pending` / `accepted` / `rejected` |
| created_at | TIMESTAMPTZ | |

---

## API Routes

### Auth
| Method | Endpoint | Note |
|---|---|---|
| POST | `/api/auth/register` | |
| POST | `/api/auth/login` | returns JWT |
| GET | `/api/auth/me` | 🔒 |

### Projects & Invitations
| Method | Endpoint | Note |
|---|---|---|
| GET | `/api/projects` | 🔒 ทุก project ที่ user เป็น member |
| POST | `/api/projects` | 🔒 |
| GET | `/api/projects/:id` | 🔒 member only |
| PATCH | `/api/projects/:id` | 🔒 owner only |
| DELETE | `/api/projects/:id` | 🔒 owner only |
| GET | `/api/projects/:id/stats` | 🔒 member — ดึงสถิติตัวเลขสรุปผลโปรเจกต์ |
| GET | `/api/invitations` | 🔒 ดึงรายการคำเชิญที่เข้าหาตัวเอง (pending) |
| POST | `/api/projects/:id/invitations` | 🔒 owner — ส่งคำเชิญโดยค้นหาผ่าน email หรือ username |
| PUT | `/api/invitations/:id/respond` | 🔒 ผู้ถูกเชิญกด accept / reject |
| POST | `/api/invitations/:id/accept` | 🔒 ผู้ถูกเชิญกดตอบรับคำเชิญ |
| POST | `/api/invitations/:id/reject` | 🔒 ผู้ถูกเชิญกดปฏิเสธคำเชิญ |
| DELETE | `/api/projects/:id/members/:userId` | 🔒 owner |

### Tasks
| Method | Endpoint | Note |
|---|---|---|
| GET | `/api/projects/:id/tasks` | 🔒 member |
| POST | `/api/projects/:id/tasks` | 🔒 member |
| PATCH | `/api/tasks/:id` | 🔒 member (Partial Update: title, description, priority, due_date, assignee_id) |
| PATCH | `/api/tasks/:id/status` | 🔒 member (Quick Action: update status on Kanban board) |
| DELETE | `/api/tasks/:id` | 🔒 member |

### Subtasks
| Method | Endpoint | Note |
|---|---|---|
| GET | `/api/tasks/:id/subtasks` | 🔒 member |
| POST | `/api/tasks/:id/subtasks` | 🔒 member |
| PATCH | `/api/subtasks/:id/status` | 🔒 member — สลับสถานะติ๊กถูก subtask |
| DELETE | `/api/subtasks/:id` | 🔒 member |

### Dashboard
| Method | Endpoint | Note |
|---|---|---|
| GET | `/api/dashboard` | 🔒 task + subtask ที่ยังไม่ done เรียง due_date |

---

## Auth Flow

```
Request → JWT Middleware → Project Membership Check → Handler
```

- Password: bcrypt cost ≥ 12
- Invitation token: crypto/rand
- CORS: whitelist เฉพาะ Vercel domain
- Rate limit: บน `/api/auth/*`

---

## Phase 2+ (บันทึกไว้กันลืม)
- Kanban view → ต้องเพิ่ม `order` field ใน tasks
- Label/Tag → ตาราง `labels` + `task_labels` (many-to-many)
- Comment → ตาราง `comments`
- Push notification → VAPID + Service Worker + Cron Job
