package request

// CreateBookingRequest - Request para crear reserva
type CreateBookingRequest struct {
	TrainingSessionID uint   `json:"training_session_id" binding:"required"`
	PlayerID          uint   `json:"player_id" binding:"required"`
	RequestNotes      string `json:"request_notes"`
}

// ApproveBookingRequest - Request para aprobar reserva
type ApproveBookingRequest struct {
	Notes string `json:"notes"`
}

// RejectBookingRequest - Request para rechazar reserva
type RejectBookingRequest struct {
	Notes string `json:"notes" binding:"required"`
}

// CancelBookingRequest - Request para cancelar reserva
type CancelBookingRequest struct {
	Reason string `json:"reason" binding:"required"`
}
