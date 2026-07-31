# SnuzeFlow — Backend Architecture Guidelines

ข้อกำหนดสถาปัตยกรรมภาษา Go, การจัดโครงสร้างโฟลเดอร์, การวาง Interface และการแยก Model 3 ชั้นฝั่ง Backend

---

## 1. Directory Structure

```text
backend/
├── cmd/api/main.go                 # Application Entry Point & Explicit DI Wiring
├── internal/
│   ├── config/                     # Environment & DB Connections
│   ├── domain/                     # Pure Domain Models (Zero external tags)
│   ├── dto/                        # Request / Response DTO Structs (json, binding tags)
│   ├── handler/                    # HTTP Handlers (Gin)
│   ├── middleware/                 # Auth JWT, Logging, CORS
│   ├── repository/                 # Database Layer & DB Models (db tags)
│   ├── response/                   # Standard API Response & Central Error Handler
│   └── service/                    # Business Logic Layer & Consumer Interfaces
├── migrations/                     # Versioned SQL Migration Files (golang-migrate)
└── pkg/apperrors/                  # Custom Domain Errors Definition
```

---

## 2. Idiomatic Go Interface Placement Rule

> [!IMPORTANT]
> **"Accept interfaces, return structs"** — เปิดประกาศ Interface เฉพาะใน Package ฝั่งผู้ใช้งาน (Consumer) เท่านั้น ห้ามเปิดประกาศไว้ใน `repository` package

```go
// internal/service/project_service.go
package service

// Consumer เป็นผู้กำหนด interface เท่าที่ตนเองต้องใช้
type ProjectRepository interface {
    Create(ctx context.Context, project *domain.Project) error
    GetByID(ctx context.Context, id string) (*domain.Project, error)
}
```

---

## 3. Strict 3-Model Isolation

แยก Model ออกเป็น 3 ชั้นอย่างเด็ดขาดเพื่อป้องกัน DB Tags / JSON Tags รั่วข้าม Layer:

1. **DTO (`internal/dto/`)**: ใช้สำหรับ HTTP API Request/Response เท่านั้น (`json` และ `binding` tags)
2. **Domain Model (`internal/domain/`)**: เป็นศูนย์กลางของ Business Logic (**Pure Go Struct ไร้ tag ใดๆ**)
3. **DB Model (`internal/repository/model/`)**: ใช้สำหรับ SQL Queries และสื่อสารกับ Database Engine (`db` tags)

---

## 4. Explicit Dependency Injection & Testing

* **Manual Constructors**: ใช้ `New...` Constructor Functions เท่านั้น ห้ามใช้ Reflection DI Framework (เช่น Uber FX)
* **Table-Driven Testing**: ทุก Unit Test ในชั้น Service ต้องใช้รูปแบบ Table-Driven Test ร่วมกับ `stretchr/testify`
