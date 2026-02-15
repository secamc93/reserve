package mappers

import (
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/response"
)

// BookingToResponse mapea entidad de dominio a respuesta HTTP
func BookingToResponse(b *domain.Booking) response.BookingData {
	data := response.BookingData{
		ID:                 b.ID,
		TrainingSessionID:  b.TrainingSessionID,
		PlayerID:           b.PlayerID,
		BookedByUserID:     b.BookedByUserID,
		BookingStatusID:    b.BookingStatusID,
		BookingDate:        b.BookingDate,
		RequestNotes:       b.RequestNotes,
		ReviewedAt:         b.ReviewedAt,
		ReviewedByCoachID:  b.ReviewedByCoachID,
		ResponseNotes:      b.ResponseNotes,
		CancelledAt:        b.CancelledAt,
		CancelledByUserID:  b.CancelledByUserID,
		CancellationReason: b.CancellationReason,
		Price:              b.Price,
		IsPaid:             b.IsPaid,
		PaymentDate:        b.PaymentDate,
		PaymentMethod:      b.PaymentMethod,
		CreatedAt:          b.CreatedAt,
		UpdatedAt:          b.UpdatedAt,
	}

	if b.Session != nil {
		data.Session = &response.SessionRef{
			ID:            b.Session.ID,
			ScheduledDate: b.Session.ScheduledDate,
			SessionMode:   b.Session.SessionMode,
			Location:      b.Session.Location,
		}
	}

	if b.Player != nil {
		data.Player = &response.PlayerRef{
			ID:        b.Player.ID,
			FirstName: b.Player.FirstName,
			LastName:  b.Player.LastName,
		}
	}

	if b.Status != nil {
		data.Status = &response.StatusRef{
			ID:      b.Status.ID,
			Name:    b.Status.Name,
			Code:    b.Status.Code,
			Color:   b.Status.Color,
			IsFinal: b.Status.IsFinal,
		}
	}

	return data
}
