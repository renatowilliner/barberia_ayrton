package google

import (
	"context"
	"log"

	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type CalendarAdapter struct {
	// client *calendar.Service
}

func NewCalendarAdapter() ports.CalendarService {
	// In a real app, initialize Google Client here using credentials.json
	return &CalendarAdapter{}
}

func (c *CalendarAdapter) CreateEvent(ctx context.Context, appointment *domain.Appointment) (string, error) {
	// TODO: Implement actual Google Calendar API call
	// For now, return a dummy Event ID
	// For now, return empty string so frontend falls back to "Create Link"
	// eventID := uuid.New().String()
	log.Printf("[GoogleCalendar] Creating event for appointment %s on %s. (Simulated)", appointment.ID, appointment.StartTime)
	return "", nil
}

func (c *CalendarAdapter) DeleteEvent(ctx context.Context, eventID string) error {
	log.Printf("[GoogleCalendar] Deleting event %s", eventID)
	return nil
}
