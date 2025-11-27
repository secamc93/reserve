package request

import (
	"time"
)

type Reservation struct {
	BusinessID     uint      `json:"business_id"`
	Name           string    `json:"name" binding:"required"`
	Email          string    `json:"email" binding:"required"`
	Phone          string    `json:"phone" binding:"required"`
	Dni            *string   `json:"dni,omitempty"`
	StartAt        time.Time `json:"start_at" binding:"required"`
	EndAt          time.Time `json:"end_at" binding:"required"`
	NumberOfGuests int       `json:"number_of_guests" binding:"required"`
}
