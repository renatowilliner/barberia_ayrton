package repository

import (
	"log"

	"github.com/renatowilliner/barberia_ayrton/server/internal/core/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// AutoMigrate
	err = db.AutoMigrate(&domain.User{}, &domain.Availability{}, &domain.Appointment{})
	if err != nil {
		log.Printf("Error migrating database: %v", err)
		return nil, err
	}

	return db, nil
}
