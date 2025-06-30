package request

import (
	"time"
)

type Reservation struct {
	RestaurantID   uint      `json:"restaurant_id"`
	TableID        uint      `json:"table_id"`
	ClientID       uint      `json:"client_id"`
	StartAt        time.Time `json:"start_at"`
	EndAt          time.Time `json:"end_at"`
	NumberOfGuests int       `json:"number_of_guests"`
}
