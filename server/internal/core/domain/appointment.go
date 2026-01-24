package domain

import (
	"time"

	"github.com/google/uuid"
)

type AppointmentStatus string

const (
	StatusPending   AppointmentStatus = "pending"
	StatusConfirmed AppointmentStatus = "confirmed"
	StatusCancelled AppointmentStatus = "cancelled"
)

type Appointment struct {
	ID            uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ClientID      uuid.UUID         `gorm:"type:uuid" json:"client_id"`
	Client        User              `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	StartTime     time.Time         `json:"start_time"`
	EndTime       time.Time         `json:"end_time"`
	Status        AppointmentStatus `gorm:"default:'pending'" json:"status"`
	GoogleEventID string            `json:"google_event_id,omitempty"`
	Notes         string            `json:"notes,omitempty"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
}
