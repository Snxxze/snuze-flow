# SnuzeFlow — System Overview & Architecture

เอกสารภาพรวมสถาปัตยกรรมระดับระบบ (System-level Architecture) สำหรับโครงการ **SnuzeFlow**

---

## 1. High-Level System Architecture

```text
[ Browser / PWA Client ]
         │ HTTPS / REST API (JSON)
         ▼
[ Frontend: React + Vite ]       ──> Host บน Vercel (Static CDN)
         │ HTTPS / REST API
         ▼
[ Backend: Go + Gin ]            ──> Host บน Render (Docker Container)
         │ PostgreSQL Driver
         ▼
[ Database: Neon Postgres ]      ──> Cloud Serverless Postgres
```

---

## 2. Tech Stack Summary

* **Frontend**: React 18+, Vite, TypeScript, TailwindCSS, TanStack Query (React Query), React Router v6
* **Backend**: Go 1.22+, Gin Web Framework, `golang-migrate`
* **Database**: PostgreSQL (Neon Cloud)
* **API Spec & Generation**: OpenAPI v3 (via `swag init`), `openapi-typescript`

---

## 3. High-Level Data & Auth Flow

```text
User Request ──> JWT Auth Middleware ──> Project Membership Check ──> Business Logic Handler
```

1. **Authentication**: ใช้ Email + Password ในการสมัครและล็อกอิน รหัสผ่านแฮชด้วย `bcrypt` (cost $\ge$ 12)
2. **Authorization**: ยืนยันตัวตนด้วย **JWT Token** (อายุ 24 ชั่วโมง) ส่งผ่าน HTTP Header `Authorization: Bearer <token>`
3. **Project Membership Access**: ทุกการเข้าถึง Project หรือ Task ต้องผ่านการตรวจสอบสิทธิ์ในตาราง `project_members`

---

## 4. Structured Logging Standard (`log/slog`)

ใช้ **`log/slog`** (Go 1.21+ Standard Library) ในการบันทึก Log รูปแบบ JSON พร้อมแนบ `request_id` อัตโนมัติในทุกคำขอ

### 4.1 `slog` Logger Initialization (`internal/config/logger.go`)
```go
package config

import (
    "log/slog"
    "os"
)

func InitLogger() *slog.Logger {
    handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    })
    logger := slog.New(handler)
    slog.SetDefault(logger)
    return logger
}
```

### 4.2 Gin Request Logging Middleware (`internal/middleware/logging.go`)
```go
func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        reqID := c.GetString("requestId")
        
        c.Next()

        latency := time.Since(start)
        status := c.Writer.Status()

        attributes := []slog.Attr{
            slog.String("request_id", reqID),
            slog.String("method", c.Request.Method),
            slog.String("path", c.Request.URL.Path),
            slog.Int("status", status),
            slog.Duration("latency", latency),
            slog.String("client_ip", c.ClientIP()),
        }

        if status >= 500 {
            logger.Error("server_error", slog.Group("http", attributes...))
        } else if status >= 400 {
            logger.Warn("client_error", slog.Group("http", attributes...))
        } else {
            logger.Info("request_completed", slog.Group("http", attributes...))
        }
    }
}
```

---

## 5. Security & Rate Limiting Specifications

1. **CORS Configuration**:
   * Whitelist เฉพาะ Vercel Production Domain และ `http://localhost:5173` สำหรับ Local Dev
   * Credentials Allowed: `true` (กรณีส่ง Cookie/Authorization Header)
2. **Rate Limiting**:
   * จำกัดคำขอจำพวก Authentication (`/api/auth/login`, `/api/auth/register`) ไว้ที่ **10 requests / minute / IP** เพื่อป้องกัน Brute-Force attack
3. **Security Headers**:
   * เปิดใช้งาน Security Headers ผ่าน Middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`

---

## 6. Environment Variables Contract (.env Specifications)

### 6.1 Backend Contract (`backend/.env`)
```env
PORT=8080
ENV=development
DATABASE_URL=postgres://user:password@ep-neon-123.neon.tech/snuzeflow?sslmode=require
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRY_HOURS=24
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://snuzeflow.vercel.app
```

### 6.2 Frontend Contract (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 7. Performance Optimization & Risk Mitigation Standards

ข้อกำหนดป้องกันจุดคอขวด (Bottlenecks) ด้านประสิทธิภาพของระบบ

### 7.1 Database & Query Optimization (Neon Postgres)
* **Single Query Optimization**: ห้ามวนลูปยิง SQL Query แบบ N+1 ให้ใช้ `LEFT JOIN` + `JSON_AGG` ใน PostgreSQL ดึง Tasks + Subtasks จบใน 1 Network Roundtrip
* **Mandatory Database Indexes**: ทุกตารางต้องมี Index บน Foreign Keys และคอลัมน์เรียงลำดับ (`project_id`, `user_id`, `due_date`, `status`)
* **Connection Pooling**: ตั้งค่า Connection Pool ใน Go เพื่อป้องกันการเปิด/ปิด connection บ่อยเกินไป:
  ```go
  db.SetMaxOpenConns(10)
  db.SetMaxIdleConns(5)
  db.SetConnMaxLifetime(15 * time.Minute)
  ```

### 7.2 Frontend Performance & Asset Optimization
* **Route Code Splitting**: ใช้ `React.lazy()` สำหรับตัดแบ่ง Bundle หน้าที่ไม่ใช่หน้าแรก (เช่น `/projects/:id`, `/invitations`) เพื่อให้ Initial JS Bundle มีขนาดเล็กที่สุด
* **Debounced Search Inputs**: การค้นหา Username/Email สำหรับส่งคำเชิญ ต้องใส่ **Debounce 300ms** ห้ามยิง API ทุกๆ การกดแป้นพิมพ์
* **TanStack Query Cache Strategy**: ตั้งค่า `staleTime: 1000 * 60 * 5` (5 นาที) สำหรับ static list เพื่อลดการยิง API ซ้ำซ้อนขณะสลับหน้า

### 7.3 Infrastructure & Network Optimization
* **HTTP Compression**: เปิดใช้งาน Gzip / Brotli Compression บน Gin Middleware และ Vercel
* **Graceful Cold Start UX**: หน้าบ้านต้องแสดง Skeleton Loader และ Toast แจ้งเตือนสถานะเซิร์ฟเวอร์ทันทีเมื่อการเชื่อมต่อใช้เวลาเกิน 2 วินาที (จากผลกระทบ Render/Neon Free Tier Cold Start)
