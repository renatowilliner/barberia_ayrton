package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
	"gorm.io/gorm"
)

type AppointmentRepository struct {
	db *gorm.DB
}

func NewAppointmentRepository(db *gorm.DB) ports.AppointmentRepository {
	return &AppointmentRepository{db: db}
}

func (r *AppointmentRepository) Create(ctx context.Context, appointment *domain.Appointment) error {
	// Check for overlap here if not handled by constraints?
	// Relying on uniqueness constraint which we should add in schema or migrations.
	// But GORM AutoMigrate doesn't add complex constraints easily without tags.
	// We can explicitly check validation here for better error message.

	// Check if there is already an appointment that overlaps
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Appointment{}).
		Where("status != ?", domain.StatusCancelled).
		Where("start_time < ? AND end_time > ?", appointment.EndTime, appointment.StartTime).
		Count(&count).Error

	if err != nil {
		return err
	}
	if count > 0 {
		return gorm.ErrDuplicatedKey // Or custom error
	}

	return r.db.WithContext(ctx).Create(appointment).Error
}

func (r *AppointmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Appointment, error) {
	var appt domain.Appointment
	err := r.db.WithContext(ctx).Preload("Client").Where("id = ?", id).First(&appt).Error
	return &appt, err
}

func (r *AppointmentRepository) Update(ctx context.Context, appointment *domain.Appointment) error {
	return r.db.WithContext(ctx).Save(appointment).Error
}

func (r *AppointmentRepository) ListByDateRange(ctx context.Context, start, end time.Time) ([]domain.Appointment, error) {
	var appts []domain.Appointment
	err := r.db.WithContext(ctx).Preload("Client").
		Where("start_time >= ? AND start_time < ?", start, end).
		Find(&appts).Error
	return appts, err
}

func (r *AppointmentRepository) CountByMonth(ctx context.Context, month time.Month, year int) (int64, error) {
	var count int64
	start := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)
	err := r.db.WithContext(ctx).Model(&domain.Appointment{}).
		Where("start_time >= ? AND start_time < ?", start, end).
		Count(&count).Error
	return count, err
}

func (r *AppointmentRepository) CountCompletedByMonth(ctx context.Context, month time.Month, year int) (int64, error) {
	var count int64
	start := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)
	err := r.db.WithContext(ctx).Model(&domain.Appointment{}).
		Where("status = ? AND start_time >= ? AND start_time < ?", domain.StatusConfirmed, start, end). // Assuming Confirmed = Completed for now
		Count(&count).Error
	return count, err
}

func (r *AppointmentRepository) CountByStatus(ctx context.Context, status domain.AppointmentStatus) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Appointment{}).
		Where("status = ?", status).
		Count(&count).Error
	return count, err
}
