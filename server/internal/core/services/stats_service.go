package services

import (
	"context"
	"time"

	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type StatsService struct {
	apptRepo ports.AppointmentRepository
}

func NewStatsService(apptRepo ports.AppointmentRepository) *StatsService {
	return &StatsService{apptRepo: apptRepo}
}

func (s *StatsService) GetMonthlyStats(ctx context.Context) (map[string]interface{}, error) {
	now := time.Now()
	month := now.Month()
	year := now.Year()

	total, err := s.apptRepo.CountByMonth(ctx, month, year)
	if err != nil {
		return nil, err
	}

	completed, err := s.apptRepo.CountCompletedByMonth(ctx, month, year)
	if err != nil {
		return nil, err
	}

	// Attendance rate logic would need more granular status (Completed vs NoShow)
	// For now, using Confirmed vs Total as a proxy or just returning raw numbers.

	pending, err := s.apptRepo.CountByStatus(ctx, domain.StatusPending)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_appointments": total,
		"completed":          completed,
		"pending":            pending,
		"month":              month.String(),
		"year":               year,
	}, nil
}
