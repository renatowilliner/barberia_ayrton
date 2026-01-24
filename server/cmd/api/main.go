package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/google"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/handler"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/messaging"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/repository"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/services"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=barberia port=5432 sslmode=disable"
	}

	db, err := repository.NewDB(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Repositories
	userRepo := repository.NewUserRepository(db)
	availRepo := repository.NewAvailabilityRepository(db)
	apptRepo := repository.NewAppointmentRepository(db)

	// Adapters
	calendarAdapter := google.NewCalendarAdapter()
	messagingAdapter := messaging.NewLoggingWhatsApp()

	// Services
	availService := services.NewAvailabilityService(availRepo, apptRepo)
	apptService := services.NewAppointmentService(apptRepo, availRepo, userRepo, calendarAdapter, messagingAdapter)
	statsService := services.NewStatsService(apptRepo)

	// User handler
	userHandler := handler.NewUserHandler(userRepo)
	authHandler := handler.NewAuthHandler(userRepo)

	// Handlers
	availHandler := handler.NewAvailabilityHandler(availService)
	apptHandler := handler.NewAppointmentHandler(apptService)
	statsHandler := handler.NewStatsHandler(statsService)

	// Router
	r := gin.Default()

	// CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // For dev
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type"}
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		// Availability
		api.POST("/availability", availHandler.SetAvailability)
		api.GET("/availability", availHandler.GetAvailability)
		api.GET("/slots", availHandler.GetSlots)

		// Appointments
		api.POST("/appointments", apptHandler.Create)
		api.GET("/appointments", apptHandler.List)
		api.POST("/appointments/:id/confirm", apptHandler.Confirm)
		api.POST("/appointments/:id/cancel", apptHandler.Cancel)

		// Users
		api.GET("/users", userHandler.List)
		api.GET("/users/:id", userHandler.Get)

		// Auth
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		// Stats
		api.GET("/admin/stats", statsHandler.GetDashboardStats)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
