package request

type CancelReservation struct {
	Reason string `json:"reason,omitempty"` // Razón opcional de cancelación
}
