package dtos

// ReservationStatusDTO representa un estado de reserva
type ReservationStatusDTO struct {
	ID   uint   `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}
