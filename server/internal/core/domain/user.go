package domain

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleClient Role = "client"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `gorm:"uniqueIndex" json:"email" binding:"required,email"`
	Password  string    `json:"-"` // Stored hash, not exposed in JSON
	Phone     string    `json:"phone" binding:"required"`
	Role      Role      `gorm:"default:'client'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
