# SnuzeFlow — Database & Transaction Guidelines

ข้อกำหนดการออกแบบฐานข้อมูล PostgreSQL (Neon Cloud), SQL Migrations และกลยุทธ์ Transaction Management

---

## 1. Database Naming Conventions

1. **Table Names**: พหูพจน์ `snake_case` (`users`, `projects`, `project_members`, `project_invitations`, `tasks`, `subtasks`)
2. **Column Names**: `snake_case` (`owner_id`, `created_at`, `password_hash`)
3. **Primary Keys**: `UUID` (คอลัมน์ชื่อ `id`)
4. **Foreign Keys**: `[singular_table_name]_id` (`project_id`, `user_id`)
5. **Timestamps**: `TIMESTAMPTZ` (Timezone Aware)

---

## 2. Migration Strategy (Versioned SQL Migrations)

* ใช้ **`golang-migrate`** เก็บไฟล์ใน `backend/migrations/`
* ชื่อไฟล์: `{version}_{description}.up.sql` และ `{version}_{description}.down.sql`

---

## 3. Transaction Strategy via Context

ซ่อน `*sql.Tx` ไว้ใน `context.Context` ผ่าน Transactor Abstraction เพื่อให้ Service Layer สามารถเปิด/ปิด Transaction ข้ามหลาย Repository ได้โดยไม่ต้องรู้รายละเอียด SQL Driver

```go
func (s *ProjectService) CreateProject(ctx context.Context, input *domain.Project) error {
    return s.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
        if err := s.projectRepo.Create(txCtx, input); err != nil {
            return err
        }
        return s.memberRepo.AddMember(txCtx, &domain.ProjectMember{...})
    })
}
```
