package services

import (
	"context"
	"errors"
	"time"

	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type AvailabilityService struct {
	repo     ports.AvailabilityRepository
	apptRepo ports.AppointmentRepository
}

func NewAvailabilityService(repo ports.AvailabilityRepository, apptRepo ports.AppointmentRepository) *AvailabilityService {
	return &AvailabilityService{repo: repo, apptRepo: apptRepo}
}

func (s *AvailabilityService) SetAvailability(ctx context.Context, date, start, end string) error {
	// TODO: Validate date format YYYY-MM-DD
	availability := &domain.Availability{
		Date:      date,
		StartTime: start,
		EndTime:   end,
		IsBlocked: false,
	}
	return s.repo.Save(ctx, availability)
}

func (s *AvailabilityService) GetAvailability(ctx context.Context) ([]domain.Availability, error) {
	return s.repo.ListAll(ctx)
}

func (s *AvailabilityService) GetAvailableSlots(ctx context.Context, date time.Time) ([]time.Time, error) {
	// 1. Get availability for specific date
	dateStr := date.Format("2006-01-02")
	avail, err := s.repo.GetByDate(ctx, dateStr)
	if err != nil {
		return nil, err
	}
	if avail == nil || avail.IsBlocked {
		return []time.Time{}, nil
	}

	// 2. Parse start and end times
	start, err := time.Parse("15:04", avail.StartTime)
	if err != nil {
		return nil, errors.New("invalid start time format configured")
	}
	end, err := time.Parse("15:04", avail.EndTime)
	if err != nil {
		return nil, errors.New("invalid end time format configured")
	}

	// 3. Generate 1 hour slots
	var slots []time.Time

	// Create start time on the specific date in UTC
	current := time.Date(date.Year(), date.Month(), date.Day(), start.Hour(), start.Minute(), 0, 0, time.UTC)
	endTime := time.Date(date.Year(), date.Month(), date.Day(), end.Hour(), end.Minute(), 0, 0, time.UTC)

	// fetch appointments for the day to exclude (in UTC)
	appts, err := s.apptRepo.ListByDateRange(ctx, time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC), time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, time.UTC))
	if err != nil {
		return nil, err
	}

	// Generate slots: include any slot whose START time is before the end time
	// This ensures if end time is 13:00, we include the 12:00-13:00 slot
	for current.Before(endTime) {
		occupied := false
		for _, a := range appts {
			if a.Status == domain.StatusCancelled {
				continue
			}
			// if appointment overlaps this slot (any overlap), mark occupied
			slotEnd := current.Add(1 * time.Hour)
			if a.StartTime.Before(slotEnd) && a.EndTime.After(current) {
				occupied = true
				break
			}
		}
		if !occupied {
			slots = append(slots, current)
		}
		current = current.Add(1 * time.Hour)
	}

	return slots, nil
}
