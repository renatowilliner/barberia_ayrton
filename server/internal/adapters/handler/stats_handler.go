package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type StatsHandler struct {
	svc ports.StatsService
}

func NewStatsHandler(svc ports.StatsService) *StatsHandler {
	return &StatsHandler{svc: svc}
}

func (h *StatsHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.svc.GetMonthlyStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}
