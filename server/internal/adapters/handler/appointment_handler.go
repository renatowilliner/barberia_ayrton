package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type AppointmentHandler struct {
	svc ports.AppointmentService
}

func NewAppointmentHandler(svc ports.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{svc: svc}
}

type CreateAppointmentRequest struct {
	ClientID  string    `json:"client_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	StartTime time.Time `json:"start_time" binding:"required"`
	Notes     string    `json:"notes"`
}

func (h *AppointmentHandler) Create(c *gin.Context) {
	var req CreateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If ClientID provided, prefer creating appointment for that client
	if req.ClientID != "" {
		cid, err := uuid.Parse(req.ClientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid client_id"})
			return
		}
		appt, err := h.svc.CreateAppointmentForClient(c.Request.Context(), cid, req.StartTime, req.Notes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, appt)
		return
	}

	appt, err := h.svc.CreateAppointment(c.Request.Context(), req.Name, req.Email, req.Phone, req.StartTime, req.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, appt)
}

func (h *AppointmentHandler) ValidateConcurrency(c *gin.Context) {
	// Middleware or separate check if needed for complex locking,
	// currently handled by Service/Repo constraints.
}

// List returns appointments for a given date range or presets (date/month/today)
func (h *AppointmentHandler) List(c *gin.Context) {
	// Support query params: start,end (RFC3339) OR date=YYYY-MM-DD OR month=YYYY-MM
	var start time.Time
	var end time.Time
	var err error

	if s := c.Query("start"); s != "" {
		start, err = time.Parse(time.RFC3339, s)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start format, use RFC3339"})
			return
		}
		if e := c.Query("end"); e != "" {
			end, err = time.Parse(time.RFC3339, e)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end format, use RFC3339"})
				return
			}
		} else {
			end = start.Add(24 * time.Hour)
		}
	} else if date := c.Query("date"); date != "" {
		d, err := time.Parse("2006-01-02", date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
			return
		}
		start = time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, time.UTC)
		end = start.Add(24 * time.Hour)
	} else if month := c.Query("month"); month != "" {
		// expect YYYY-MM
		t, err := time.Parse("2006-01", month)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month format, use YYYY-MM"})
			return
		}
		start = time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
		end = start.AddDate(0, 1, 0)
	} else {
		// default: today
		now := time.Now().UTC()
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
		end = start.Add(24 * time.Hour)
	}

	appts, err := h.svc.ListAppointments(c.Request.Context(), start, end)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, appts)
}

func (h *AppointmentHandler) Confirm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid appointment id"})
		return
	}

	if err := h.svc.ConfirmAppointment(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "confirmed"})
}

func (h *AppointmentHandler) Cancel(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid appointment id"})
		return
	}

	if err := h.svc.CancelAppointment(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "cancelled"})
}
