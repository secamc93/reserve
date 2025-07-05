package request

import (
	"time"
)

type Reservation struct {
	RestaurantID   uint      `json:"restaurant_id" binding:"required"`
	Name           string    `json:"name" binding:"required"`
	Email          string    `json:"email" binding:"required"`
	Phone          string    `json:"phone" binding:"required"`
	Dni            uint      `json:"dni" binding:"required"`
	StartAt        time.Time `json:"start_at" binding:"required"`
	EndAt          time.Time `json:"end_at" binding:"required"`
	NumberOfGuests int       `json:"number_of_guests" binding:"required"`
}
