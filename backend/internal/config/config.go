package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                    string
	DatabaseURL             string
	JWTSecret               string
	JWTExpiryHours          int
	CORSAllowOrigin         string
	Environment             string
	AllowPublicRegistration bool
}

func LoadConfig() *Config {
	// โหลด .env เป็นหลักก่อน (สำหรับ Production หรือเป็นค่า Default ใน Dev)
	_ = godotenv.Load(".env") 

	// ถ้ามี .env.local (ใน Dev) ให้เอามาเขียนทับค่าจาก .env
	_ = godotenv.Overload(".env.local")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// การตั้งค่า DATABASE_URL สำหรับการเชื่อมต่อ Database:
	// - ระหว่างการพัฒนาใน Local: หากไม่ได้ตั้งค่า DATABASE_URL จะ fallback ไปใช้ Docker PostgreSQL (localhost:5432)
	// - การสลับไปใช้ Neon Cloud PostgreSQL ในอนาคต (Production / Staging):
	//   		ให้ตั้งค่า DATABASE_URL ใน environment หรือไฟล์ .env เป็น Connection String ของ Neon
	//   		ตัวอย่าง: DATABASE_URL="postgres://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/snuzeflow?sslmode=disable"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "snuze-flow-default-jwt-secret-key-change-in-prod"
	}

	jwtExpiryStr := os.Getenv("JWT_EXPIRY_HOURS")
	jwtExpiry := 24
	if jwtExpiryStr != "" {
		if parsed, err := strconv.Atoi(jwtExpiryStr); err == nil && parsed > 0 {
			jwtExpiry = parsed
		}
	}

	corsOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	allowPublicReg := os.Getenv("ALLOW_PUBLIC_REGISTRATION") == "true"

	return &Config{
		Port:                    port,
		DatabaseURL:             dbURL,
		JWTSecret:               jwtSecret,
		JWTExpiryHours:          jwtExpiry,
		CORSAllowOrigin:         corsOrigin,
		Environment:             env,
		AllowPublicRegistration: allowPublicReg,
	}
}
