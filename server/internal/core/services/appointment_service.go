package services

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
	"gorm.io/gorm"
)

type AppointmentService struct {
	apptRepo    ports.AppointmentRepository
	availRepo   ports.AvailabilityRepository
	userRepo    ports.UserRepository
	calendarSvc ports.CalendarService
	msgSvc      ports.MessagingService
}

func NewAppointmentService(apptRepo ports.AppointmentRepository, availRepo ports.AvailabilityRepository, userRepo ports.UserRepository, calendarSvc ports.CalendarService, msgSvc ports.MessagingService) *AppointmentService {
	return &AppointmentService{
		apptRepo:    apptRepo,
		availRepo:   availRepo,
		userRepo:    userRepo,
		calendarSvc: calendarSvc,
		msgSvc:      msgSvc,
	}
}

func (s *AppointmentService) CreateAppointment(ctx context.Context, clientName, clientEmail, clientPhone string, startTime time.Time, notes string) (*domain.Appointment, error) {
	// 1. Find or Create User
	user, err := s.userRepo.GetByEmail(ctx, clientEmail)
	if err != nil && err != gorm.ErrRecordNotFound {
		// Proceed if not found (to create), error if DB error
		// Wait, userRepo implementation of GetByEmail returns error if not found.
		// Let's assume we handle "not found" by creating.
		// NOTE: user_repo implementation uses First(), which returns ErrRecordNotFound.
	}

	if user == nil || user.ID == uuid.Nil {
		// Create new user
		newUser := &domain.User{
			Name:  clientName,
			Email: clientEmail,
			Phone: clientPhone,
			Role:  domain.RoleClient,
		}
		if err := s.userRepo.Create(ctx, newUser); err != nil {
			return nil, err
		}
		user = newUser
	}

	// 2. Check if slot is within working hours (Availability)
	dateStr := startTime.Format("2006-01-02")
	avail, err := s.availRepo.GetByDate(ctx, dateStr)
	if err != nil {
		return nil, err
	}
	if avail == nil || avail.IsBlocked {
		return nil, errors.New("barber is not available at this time")
	}

	// 3. Create Appointment
	endTime := startTime.Add(1 * time.Hour)
	appt := &domain.Appointment{
		ClientID:  user.ID,
		StartTime: startTime,
		EndTime:   endTime,
		Status:    domain.StatusPending,
		Notes:     notes,
	}

	if err := s.apptRepo.Create(ctx, appt); err != nil {
		return nil, err
	}

	// 4. Calendar Sync
	eventID, err := s.calendarSvc.CreateEvent(ctx, appt)
	if err == nil {
		appt.GoogleEventID = eventID
		_ = s.apptRepo.Update(ctx, appt)
	}

	// Send immediate WhatsApp confirmation upon booking (best-effort)
	// CHANGED: Do NOT send confirmation yet. Wait for Admin confirmation.
	// if s.msgSvc != nil && appt.Client.Phone != "" {
	// 	msg := "Tu turno fue registrado para " + appt.StartTime.Format("2006-01-02 15:04") + ". Pronto te confirmaremos."
	// 	_ = s.msgSvc.SendWhatsApp(ctx, appt.Client.Phone, msg)
	// }

	return appt, nil
}

// CreateAppointmentForClient creates an appointment for an existing client ID
func (s *AppointmentService) CreateAppointmentForClient(ctx context.Context, clientID uuid.UUID, startTime time.Time, notes string) (*domain.Appointment, error) {
	// 1. Get user
	user, err := s.userRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}

	// 2. Check availability
	dateStr := startTime.Format("2006-01-02")
	avail, err := s.availRepo.GetByDate(ctx, dateStr)
	if err != nil {
		return nil, err
	}
	if avail == nil || avail.IsBlocked {
		return nil, errors.New("barber is not available at this time")
	}

	// 3. Create Appointment
	endTime := startTime.Add(1 * time.Hour)
	appt := &domain.Appointment{
		ClientID:  user.ID,
		StartTime: startTime,
		EndTime:   endTime,
		Status:    domain.StatusPending,
		Notes:     notes,
	}

	if err := s.apptRepo.Create(ctx, appt); err != nil {
		return nil, err
	}

	// 4. Calendar Sync
	eventID, err := s.calendarSvc.CreateEvent(ctx, appt)
	if err == nil {
		appt.GoogleEventID = eventID
		_ = s.apptRepo.Update(ctx, appt)
	}

	// Send immediate WhatsApp confirmation upon booking (best-effort)
	// CHANGED: Do NOT send confirmation yet. Wait for Admin confirmation.
	// if s.msgSvc != nil && user.Phone != "" {
	// 	msg := "Tu turno fue registrado para " + appt.StartTime.Format("2006-01-02 15:04") + ". Pronto te confirmaremos."
	// 	_ = s.msgSvc.SendWhatsApp(ctx, user.Phone, msg)
	// }

	return appt, nil
}

func (s *AppointmentService) ConfirmAppointment(ctx context.Context, appointmentID uuid.UUID) error {
	appt, err := s.apptRepo.GetByID(ctx, appointmentID)
	if err != nil {
		return err
	}
	appt.Status = domain.StatusConfirmed
	if err := s.apptRepo.Update(ctx, appt); err != nil {
		return err
	}

	// Send WhatsApp notification to client (best-effort)
	if s.msgSvc != nil {
		// Sanitize and Format phone number for WhatsApp (Argentina specific)
		// Input: 03492-640018 -> Output: 5493492640018
		rawPhone := appt.Client.Phone
		sanitizedPhone := ""
		for _, c := range rawPhone {
			if c >= '0' && c <= '9' {
				sanitizedPhone += string(c)
			}
		}

		// Heuristic for Argentina:
		// If starts with 0, replace with 549
		if len(sanitizedPhone) > 1 && sanitizedPhone[0] == '0' {
			sanitizedPhone = "549" + sanitizedPhone[1:]
		} else if len(sanitizedPhone) > 0 && sanitizedPhone[0] != '5' {
			// Assume local number without 0? e.g. 3492... -> 5493492...
			// Or just leave it if we are unsure.
			// Let's safe bet: if it doesn't start with 54, prepend 549?
			// User example: +54 9 ... -> 549...
		}

		log.Printf("[DEBUG] Confirming appointment. Client: %s, RawPhone: %s, Sanitized: %s", appt.Client.Name, rawPhone, sanitizedPhone)

		if sanitizedPhone != "" {
			msg := "Tu turno ha sido confirmado para " + appt.StartTime.Format("2006-01-02 15:04") + ". ¡Te esperamos!"
			_ = s.msgSvc.SendWhatsApp(ctx, sanitizedPhone, msg)
		} else {
			log.Printf("[DEBUG] Client phone is empty or invalid!")
		}
	}

	return nil
}

func (s *AppointmentService) ListAppointments(ctx context.Context, start, end time.Time) ([]domain.Appointment, error) {
	return s.apptRepo.ListByDateRange(ctx, start, end)
}

func (s *AppointmentService) CancelAppointment(ctx context.Context, appointmentID uuid.UUID) error {
	appt, err := s.apptRepo.GetByID(ctx, appointmentID)
	if err != nil {
		return err
	}
	appt.Status = domain.StatusCancelled

	if appt.GoogleEventID != "" {
		_ = s.calendarSvc.DeleteEvent(ctx, appt.GoogleEventID)
	}

	return s.apptRepo.Update(ctx, appt)
}
