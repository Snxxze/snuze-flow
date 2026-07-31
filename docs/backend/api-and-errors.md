# SnuzeFlow — API Specification & Error Handling Guidelines

ข้อกำหนดรูปแบบการตอบกลับ REST API, Pagination Metadata, การจัดการ Error แบบศูนย์กลาง และ Swag Code Generation Pipeline

---

## 1. Standard Response Envelope Format

ใช้ HTTP Status Code เป็น Single Source of Truth (ตัด `success: true` ออกเพื่อลดความซ้ำซ้อน)

### 1.1 Single Item Success Response
```json
{
  "data": { "id": "uuid-123", "name": "SnuzeFlow" },
  "requestId": "req_abc123"
}
```

### 1.2 Collection / List Success Response (พร้อม Pagination Meta)
```json
{
  "data": [{ "id": "uuid-123", "name": "SnuzeFlow" }],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 45,
    "totalPages": 5
  },
  "requestId": "req_abc123"
}
```

### 1.3 Standard Error Response Structure
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project with specified ID was not found",
    "details": [
      { "field": "id", "issue": "must be a valid UUID" }
    ]
  },
  "requestId": "req_abc123"
}
```

---

## 2. Central Error Mapping Helper

นิยาม Custom Domain Errors ใน `pkg/apperrors` และเรียกใช้ `response.Error(c, err)` ใน Handler เพื่อแปลง Error เป็น HTTP Status Code (400, 401, 403, 404, 500) ในจุดเดียว

---

## 3. API Contract & Code Generation Pipeline

```text
[ Go Handlers + Swag Comments ] ──> (swag init) ──> [ openapi.yaml Spec ] ──> (openapi-typescript) ──> [ Frontend TS Types ]
```

* เขียน Swag Annotations บน Go Handlers อ้างอิง DTO Structs
* รันคำสั่งเดียว `npm run gen:api` (หรือ `make gen-api`) เพื่อ gen ทั้ง `openapi.yaml` และ TypeScript Types ฝั่ง Frontend อัตโนมัติ
