package mappers

import (
	"central_reserve/services/sporttraining/booking/internal/domain"
	"dbpostgres/app/infra/models"
)

// BookingToDomain mapea modelo GORM a entidad de dominio
func BookingToDomain(m *models.SessionBooking) *domain.Booking {
	booking := &domain.Booking{
		ID:                 m.ID,
		TrainingSessionID:  m.TrainingSessionID,
		PlayerID:           m.PlayerID,
		BookedByUserID:     m.BookedByUserID,
		BookingStatusID:    m.BookingStatusID,
		BookingDate:        m.BookingDate,
		RequestNotes:       m.RequestNotes,
		ReviewedAt:         m.ReviewedAt,
		ReviewedByCoachID:  m.ReviewedByCoachID,
		ResponseNotes:      m.ResponseNotes,
		CancelledAt:        m.CancelledAt,
		CancelledByUserID:  m.CancelledByUserID,
		CancellationReason: m.CancellationReason,
		Price:              m.Price,
		IsPaid:             m.IsPaid,
		PaymentDate:        m.PaymentDate,
		PaymentMethod:      m.PaymentMethod,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}

	if m.TrainingSession.ID != 0 {
		booking.Session = &domain.SessionRef{
			ID:            m.TrainingSession.ID,
			ScheduledDate: m.TrainingSession.ScheduledDate,
			SessionMode:   m.TrainingSession.SessionMode,
			Location:      m.TrainingSession.Location,
		}
	}

	if m.Player.ID != 0 {
		booking.Player = &domain.PlayerRef{
			ID:        m.Player.ID,
			FirstName: m.Player.FirstName,
			LastName:  m.Player.LastName,
		}
	}

	if m.BookingStatus.ID != 0 {
		booking.Status = &domain.StatusRef{
			ID:      m.BookingStatus.ID,
			Name:    m.BookingStatus.Name,
			Code:    m.BookingStatus.Code,
			Color:   m.BookingStatus.Color,
			IsFinal: m.BookingStatus.IsFinal,
		}
	}

	return booking
}
