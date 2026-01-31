package domain

import (
	"time"

	"github.com/google/uuid"
)

// DayOfWeek removed in favor of direct Date usage

type Availability struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Date         string    `json:"date" binding:"required"`       // YYYY-MM-DD (easier for GORM/JSON than time.Time for pure date)
	StartTime    string    `json:"start_time" binding:"required"` // Format "HH:MM"
	EndTime      string    `json:"end_time" binding:"required"`   // Format "HH:MM"
	SlotDuration int       `json:"slot_duration" default:"60"`    // Duration in minutes
	IsBlocked    bool      `json:"is_blocked"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
