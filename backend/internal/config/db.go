package config

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// ConnectDB ทำหน้าที่เริ่มต้นการเชื่อมต่อ Database Connection Pool
// หมายเหตุ: รองรับทั้ง Local Docker PostgreSQL และ Neon Cloud Postgres 
// วิธีการสลับไปใช้ Neon Cloud Postgres ในอนาคต:
// 1. คัดลอก Connection String จาก Neon Console (เช่น postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require)
// 2. กำหนดค่า DATABASE_URL ใน Environment Variable หรือในไฟล์ .env
func ConnectDB() (*sql.DB, error) {
	cfg := LoadConfig()

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// กำหนดมาตรฐาน Connection Pooling สำหรับประสิทธิภาพสูงสุด (docs/architecture/system-overview.md)
	// ทำงานได้สมบูรณ์แบบทั้งกับ Docker PostgreSQL และ Neon Serverless Postgres
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(15 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
