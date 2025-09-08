package response

// ReservationStatus representa un estado de reserva
type ReservationStatus struct {
	ID   uint   `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

// ReservationStatusListSuccessResponse representa una respuesta exitosa con lista de estados
type ReservationStatusListSuccessResponse struct {
	Success bool                `json:"success"`
	Data    []ReservationStatus `json:"data"`
}
