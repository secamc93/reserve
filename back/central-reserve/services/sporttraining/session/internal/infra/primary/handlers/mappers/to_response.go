package mappers

import (
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/response"
)

// SessionToResponse mapea entidad de dominio a respuesta HTTP
func SessionToResponse(s *domain.TrainingSession) response.SessionData {
	data := response.SessionData{
		ID:                    s.ID,
		BusinessID:            s.BusinessID,
		TrainingSessionTypeID: s.TrainingSessionTypeID,
		CoachID:               s.CoachID,
		TrainingGroupID:       s.TrainingGroupID,
		SessionMode:           s.SessionMode,
		ScheduledDate:         s.ScheduledDate,
		StartTime:             s.StartTime,
		EndTime:               s.EndTime,
		Duration:              s.Duration,
		Location:              s.Location,
		Field:                 s.Field,
		MaxParticipants:       s.MaxParticipants,
		CurrentParticipants:   s.CurrentParticipants,
		Price:                 s.Price,
		Status:                s.Status,
		IsRecurring:           s.IsRecurring,
		CoachNotes:            s.CoachNotes,
		PublicNotes:           s.PublicNotes,
		CancellationReason:    s.CancellationReason,
		CreatedAt:             s.CreatedAt,
		UpdatedAt:             s.UpdatedAt,
	}

	if s.SessionType != nil {
		data.SessionTypeName = s.SessionType.Name
		data.SessionTypeCode = s.SessionType.Code
	}

	if s.Coach != nil {
		data.CoachName = s.Coach.FirstName + " " + s.Coach.LastName
	}

	if s.Group != nil {
		data.GroupName = s.Group.Name
	}

	return data
}
