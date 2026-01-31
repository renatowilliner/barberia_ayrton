package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
)

// Manual mocks since we don't need full gomock power for this simple case
// and to avoid generating files.

type MockAvailabilityRepo struct {
	GetByDateFunc func(ctx context.Context, date string) (*domain.Availability, error)
}

func (m *MockAvailabilityRepo) Save(ctx context.Context, availability *domain.Availability) error {
	return nil
}
func (m *MockAvailabilityRepo) GetByDate(ctx context.Context, date string) (*domain.Availability, error) {
	return m.GetByDateFunc(ctx, date)
}
func (m *MockAvailabilityRepo) ListAll(ctx context.Context) ([]domain.Availability, error) {
	return nil, nil
}
func (m *MockAvailabilityRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }

type MockAppointmentRepo struct {
	ListByDateRangeFunc func(ctx context.Context, start, end time.Time) ([]domain.Appointment, error)
}

func (m *MockAppointmentRepo) Create(ctx context.Context, appointment *domain.Appointment) error {
	return nil
}
func (m *MockAppointmentRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Appointment, error) {
	return nil, nil
}
func (m *MockAppointmentRepo) Update(ctx context.Context, appointment *domain.Appointment) error {
	return nil
}
func (m *MockAppointmentRepo) ListByDateRange(ctx context.Context, start, end time.Time) ([]domain.Appointment, error) {
	return m.ListByDateRangeFunc(ctx, start, end)
}
func (m *MockAppointmentRepo) CountByMonth(ctx context.Context, month time.Month, year int) (int64, error) {
	return 0, nil
}
func (m *MockAppointmentRepo) CountCompletedByMonth(ctx context.Context, month time.Month, year int) (int64, error) {
	return 0, nil
}
func (m *MockAppointmentRepo) CountByStatus(ctx context.Context, status domain.AppointmentStatus) (int64, error) {
	return 0, nil
}

func TestGetAvailableSlots_EndTimeIncluded(t *testing.T) {
	// Setup
	mockAvailRepo := &MockAvailabilityRepo{}
	mockApptRepo := &MockAppointmentRepo{}
	svc := NewAvailabilityService(mockAvailRepo, mockApptRepo)

	ctx := context.Background()
	date := time.Date(2024, 1, 24, 0, 0, 0, 0, time.UTC)
	dateStr := "2024-01-24"

	// Mock Availability: 09:00 to 13:00
	mockAvailRepo.GetByDateFunc = func(ctx context.Context, d string) (*domain.Availability, error) {
		if d == dateStr {
			return &domain.Availability{
				Date:      dateStr,
				StartTime: "09:00",
				EndTime:   "13:00",
				IsBlocked: false,
			}, nil
		}
		return nil, nil // should not happen
	}

	// Mock Appointments: No appointments
	mockApptRepo.ListByDateRangeFunc = func(ctx context.Context, start, end time.Time) ([]domain.Appointment, error) {
		return []domain.Appointment{}, nil
	}

	// Execute
	slots, err := svc.GetAvailableSlots(ctx, date)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify
	// Expected slots: 09:00, 10:00, 11:00, 12:00, 13:00
	expectedSlots := []string{"09:00", "10:00", "11:00", "12:00", "13:00"}

	if len(slots) != len(expectedSlots) {
		t.Errorf("expected %d slots, got %d", len(expectedSlots), len(slots))
	}

	for i, slot := range slots {
		slotStr := slot.Format("15:04")
		if i < len(expectedSlots) && slotStr != expectedSlots[i] {
			t.Errorf("expected slot %d to be %s, got %s", i, expectedSlots[i], slotStr)
		}
	}
}

func TestGetAvailableSlots_30MinuteSlots(t *testing.T) {
	// Setup
	mockAvailRepo := &MockAvailabilityRepo{}
	mockApptRepo := &MockAppointmentRepo{}
	svc := NewAvailabilityService(mockAvailRepo, mockApptRepo)

	ctx := context.Background()
	date := time.Date(2024, 1, 24, 0, 0, 0, 0, time.UTC)
	dateStr := "2024-01-24"

	// Mock Availability: 09:00 to 10:00 with 30 min duration
	mockAvailRepo.GetByDateFunc = func(ctx context.Context, d string) (*domain.Availability, error) {
		if d == dateStr {
			return &domain.Availability{
				Date:         dateStr,
				StartTime:    "09:00",
				EndTime:      "10:00",
				SlotDuration: 30,
				IsBlocked:    false,
			}, nil
		}
		return nil, nil
	}

	// Mock Appointments: No appointments
	mockApptRepo.ListByDateRangeFunc = func(ctx context.Context, start, end time.Time) ([]domain.Appointment, error) {
		return []domain.Appointment{}, nil
	}

	// Execute
	slots, err := svc.GetAvailableSlots(ctx, date)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify
	// Expected slots: 09:00, 09:30, 10:00
	expectedSlots := []string{"09:00", "09:30", "10:00"}

	if len(slots) != len(expectedSlots) {
		t.Errorf("expected %d slots, got %d", len(expectedSlots), len(slots))
	}

	for i, slot := range slots {
		slotStr := slot.Format("15:04")
		if i < len(expectedSlots) && slotStr != expectedSlots[i] {
			t.Errorf("expected slot %d to be %s, got %s", i, expectedSlots[i], slotStr)
		}
	}
}
