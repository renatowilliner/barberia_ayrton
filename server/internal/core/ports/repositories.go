package ports

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	ListClients(ctx context.Context, limit, offset int) ([]domain.User, error)
}

type AvailabilityRepository interface {
	Save(ctx context.Context, availability *domain.Availability) error
	GetByDate(ctx context.Context, date string) (*domain.Availability, error)
	ListAll(ctx context.Context) ([]domain.Availability, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type AppointmentRepository interface {
	Create(ctx context.Context, appointment *domain.Appointment) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Appointment, error)
	Update(ctx context.Context, appointment *domain.Appointment) error
	ListByDateRange(ctx context.Context, start, end time.Time) ([]domain.Appointment, error)
	CountByMonth(ctx context.Context, month time.Month, year int) (int64, error)
	CountCompletedByMonth(ctx context.Context, month time.Month, year int) (int64, error)
	CountByStatus(ctx context.Context, status domain.AppointmentStatus) (int64, error)
}
