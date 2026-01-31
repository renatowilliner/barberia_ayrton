package ports

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
)

type AvailabilityService interface {
	SetAvailability(ctx context.Context, date, start, end string, duration int) error
	GetAvailability(ctx context.Context) ([]domain.Availability, error)
	GetAvailableSlots(ctx context.Context, date time.Time) ([]time.Time, error)
	DeleteAvailability(ctx context.Context, id uuid.UUID) error
}

type AppointmentService interface {
	CreateAppointment(ctx context.Context, clientName, clientEmail, clientPhone string, startTime time.Time, notes string) (*domain.Appointment, error)
	CreateAppointmentForClient(ctx context.Context, clientID uuid.UUID, startTime time.Time, notes string) (*domain.Appointment, error)
	ConfirmAppointment(ctx context.Context, appointmentID uuid.UUID) error
	CancelAppointment(ctx context.Context, appointmentID uuid.UUID) error
	ListAppointments(ctx context.Context, start, end time.Time) ([]domain.Appointment, error)
}

type CalendarService interface {
	CreateEvent(ctx context.Context, appointment *domain.Appointment) (string, error)
	DeleteEvent(ctx context.Context, eventID string) error
}

type StatsService interface {
	GetMonthlyStats(ctx context.Context) (map[string]interface{}, error)
}

type MessagingService interface {
	// SendWhatsApp sends a WhatsApp message to the given phone (in international format)
	// SendWhatsApp sends a WhatsApp message to the given phone (in international format)
	SendWhatsApp(ctx context.Context, phone string, message string) error
}

type EmailService interface {
	SendVerificationEmail(to, name, link string) error
}
