package mappers

import (
	"central_reserve/services/sporttraining/session/internal/domain"
	"dbpostgres/app/infra/models"
)

// SessionToDomain mapea modelo GORM a entidad de dominio
func SessionToDomain(m *models.TrainingSession) *domain.TrainingSession {
	session := &domain.TrainingSession{
		ID:                    m.ID,
		BusinessID:            m.BusinessID,
		TrainingSessionTypeID: m.TrainingSessionTypeID,
		CoachID:               m.CoachID,
		TrainingGroupID:       m.TrainingGroupID,
		SessionMode:           m.SessionMode,
		ScheduledDate:         m.ScheduledDate,
		StartTime:             m.StartTime,
		EndTime:               m.EndTime,
		Duration:              m.Duration,
		Location:              m.Location,
		Field:                 m.Field,
		MaxParticipants:       m.MaxParticipants,
		CurrentParticipants:   m.CurrentParticipants,
		Price:                 m.Price,
		Status:                m.Status,
		IsRecurring:           m.IsRecurring,
		CoachNotes:            m.CoachNotes,
		PublicNotes:           m.PublicNotes,
		CancellationReason:    m.CancellationReason,
		CreatedAt:             m.CreatedAt,
		UpdatedAt:             m.UpdatedAt,
	}

	if m.TrainingSessionType.ID != 0 {
		session.SessionType = &domain.SessionType{
			ID:    m.TrainingSessionType.ID,
			Name:  m.TrainingSessionType.Name,
			Code:  m.TrainingSessionType.Code,
			Color: m.TrainingSessionType.Color,
		}
	}

	if m.Coach.ID != 0 {
		session.Coach = &domain.CoachRef{
			ID:        m.Coach.ID,
			FirstName: m.Coach.FirstName,
			LastName:  m.Coach.LastName,
		}
	}

	if m.TrainingGroup != nil {
		session.Group = &domain.GroupRef{
			ID:       m.TrainingGroup.ID,
			Name:     m.TrainingGroup.Name,
			Category: m.TrainingGroup.Category,
		}
	}

	return session
}
