package handler

import (
	"net/http"

	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userRepo     ports.UserRepository
	emailService ports.EmailService
}

func NewAuthHandler(userRepo ports.UserRepository, emailService ports.EmailService) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, emailService: emailService}
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	existing, _ := h.userRepo.GetByEmail(c.Request.Context(), req.Email)
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "user already exists"})
		return
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	token := uuid.New().String()

	user := &domain.User{
		Name:              req.Name,
		Email:             req.Email,
		Phone:             req.Phone,
		Password:          string(hashedBytes),
		Role:              domain.RoleClient,
		VerificationToken: token,
		IsVerified:        false,
	}

	if err := h.userRepo.Create(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Generate verification link (hardcoded frontend URL for now, ideally env var)
	// Assuming frontend runs on localhost:5173 for dev
	link := "http://localhost:5173/verify-email?token=" + token

	// Send email asynchronously to not block response
	go func() {
		if err := h.emailService.SendVerificationEmail(user.Email, user.Name, link); err != nil {
			// Log error (should have a logger)
			println("Failed to send verification email:", err.Error())
		}
	}()

	c.JSON(http.StatusCreated, user)
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token is required"})
		return
	}

	// This is inefficient, but for MVP it works. Ideally look up by token index.
	// Since we don't have GetByToken in repo yet, we might need to add it or iterate (bad).
	// Let's add GetByVerificationToken to UserRepository first.
	user, err := h.userRepo.GetByVerificationToken(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token"})
		return
	}

	user.IsVerified = true
	user.VerificationToken = "" // Clear token

	if err := h.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "email verified successfully"})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userRepo.GetByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email not verified. please check your inbox"})
		return
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-me-in-prod" // Safe fallback for dev, but warning for prod
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // 24 hours expiration
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user":  user,
	})
}
