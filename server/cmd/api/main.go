package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/google"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/handler"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/messaging"
	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/middleware"

	"github.com/renatowilliner/barberia_ayrton/server/internal/adapters/repository"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/services"
)

func main() {
	// Load env vars
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

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

	// Email Service (Env vars or hardcoded for MVP/Plan)
	// Ideally: os.Getenv("SMTP_HOST"), ...
	emailService := services.NewEmailService(
		os.Getenv("SMTP_HOST"),
		587, // Port, maybe parse from env
		os.Getenv("SMTP_USER"),
		os.Getenv("SMTP_PASSWORD"),
		"no-reply@barberia-ayrton.com",
	)

	// User handler
	userHandler := handler.NewUserHandler(userRepo)
	authHandler := handler.NewAuthHandler(userRepo, emailService)

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
		// Auth
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)
		api.GET("/auth/verify", authHandler.VerifyEmail)

		// Admin Routes (Protected)
		admin := api.Group("/")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			// Admin Stats
			admin.GET("/admin/stats", statsHandler.GetDashboardStats)

			// Availability Management
			admin.POST("/availability", availHandler.SetAvailability)
			admin.DELETE("/availability/:id", availHandler.DeleteAvailability)

			// Appointment Management
			admin.GET("/appointments", apptHandler.List)

			// User Management
			admin.GET("/users", userHandler.List)
			admin.GET("/users/:id", userHandler.Get)
		}
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
