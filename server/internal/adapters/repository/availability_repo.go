package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
	"gorm.io/gorm"
)

type AvailabilityRepository struct {
	db *gorm.DB
}

func NewAvailabilityRepository(db *gorm.DB) ports.AvailabilityRepository {
	return &AvailabilityRepository{db: db}
}

func (r *AvailabilityRepository) Save(ctx context.Context, availability *domain.Availability) error {
	// If exists for date, update. Else create.
	var existing domain.Availability
	err := r.db.WithContext(ctx).Where("date = ?", availability.Date).First(&existing).Error
	if err == nil {
		// Update
		availability.ID = existing.ID
		return r.db.WithContext(ctx).Save(availability).Error
	}
	// Create
	return r.db.WithContext(ctx).Create(availability).Error
}

func (r *AvailabilityRepository) GetByDate(ctx context.Context, date string) (*domain.Availability, error) {
	var avail domain.Availability
	err := r.db.WithContext(ctx).Where("date = ?", date).First(&avail).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &avail, err
}

func (r *AvailabilityRepository) ListAll(ctx context.Context) ([]domain.Availability, error) {
	var avails []domain.Availability
	err := r.db.WithContext(ctx).Find(&avails).Error
	return avails, err
}

func (r *AvailabilityRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Availability{}, id).Error
}
