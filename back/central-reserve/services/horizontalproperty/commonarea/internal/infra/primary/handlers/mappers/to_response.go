package mappers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
)

// ReservationToResponse mapea dominio a response
func ReservationToResponse(r *domain.CommonAreaReservation) response.ReservationResponse {
	return response.ReservationResponse{
		ID:                  r.ID,
		BusinessID:          r.BusinessID,
		CommonAreaID:        r.CommonAreaID,
		PropertyUnitID:      r.PropertyUnitID,
		ResidentID:          r.ResidentID,
		ReservationStatusID: r.ReservationStatusID,
		ReservationDate:     r.ReservationDate,
		StartTime:           r.StartTime,
		EndTime:             r.EndTime,
		DurationHours:       r.DurationHours,
		NumberOfGuests:      r.NumberOfGuests,
		Purpose:             r.Purpose,
		QRCode:              r.QRCode,
		AccessCode:          r.AccessCode,
		CreatedAt:           r.CreatedAt,
	}
}
