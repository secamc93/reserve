package request

import (
	"time"
)

type UpdateReservation struct {
	TableID        *uint      `json:"table_id,omitempty"`
	StartAt        *time.Time `json:"start_at,omitempty"`
	EndAt          *time.Time `json:"end_at,omitempty"`
	NumberOfGuests *int       `json:"number_of_guests,omitempty"`
	StatusID       *uint      `json:"status_id,omitempty"`
}
