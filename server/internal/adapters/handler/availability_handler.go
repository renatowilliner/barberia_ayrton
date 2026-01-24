package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type AvailabilityHandler struct {
	svc ports.AvailabilityService
}

func NewAvailabilityHandler(svc ports.AvailabilityService) *AvailabilityHandler {
	return &AvailabilityHandler{svc: svc}
}

type SetAvailabilityRequest struct {
	Date      string `json:"date" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
}

func (h *AvailabilityHandler) SetAvailability(c *gin.Context) {
	var req SetAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate date format YYYY-MM-DD
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Expected YYYY-MM-DD"})
		return
	}

	err := h.svc.SetAvailability(c.Request.Context(), req.Date, req.StartTime, req.EndTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Availability updated"})
}

func (h *AvailabilityHandler) GetAvailability(c *gin.Context) {
	avails, err := h.svc.GetAvailability(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, avails)
}

func (h *AvailabilityHandler) GetSlots(c *gin.Context) {
	dateStr := c.Query("date") // Format YYYY-MM-DD
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	slots, err := h.svc.GetAvailableSlots(c.Request.Context(), date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, slots)
}
