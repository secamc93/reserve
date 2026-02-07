package mappers

import (
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"dbpostgres/app/infra/models"
)

// AttendanceToDomain mapea modelo GORM a entidad de dominio
func AttendanceToDomain(m *models.STAttendanceRecord) *domain.AttendanceRecord {
	record := &domain.AttendanceRecord{
		ID:                  m.ID,
		TrainingSessionID:   m.TrainingSessionID,
		PlayerID:            m.PlayerID,
		AttendanceStatusID:  m.AttendanceStatusID,
		CheckInTime:         m.CheckInTime,
		CheckOutTime:        m.CheckOutTime,
		RecordedByCoachID:   m.RecordedByCoachID,
		RecordedAt:          m.RecordedAt,
		PerformanceRating:   m.PerformanceRating,
		CoachFeedback:       m.CoachFeedback,
		PlayerNotes:         m.PlayerNotes,
		JustificationReason: m.JustificationReason,
		JustificationProof:  m.JustificationProof,
		CreatedAt:           m.CreatedAt,
		UpdatedAt:           m.UpdatedAt,
	}

	if m.TrainingSession.ID != 0 {
		record.TrainingSession = &domain.SessionRef{
			ID:            m.TrainingSession.ID,
			ScheduledDate: m.TrainingSession.ScheduledDate,
			Location:      m.TrainingSession.Location,
		}
	}

	if m.Player.ID != 0 {
		record.Player = &domain.PlayerRef{
			ID:        m.Player.ID,
			FirstName: m.Player.FirstName,
			LastName:  m.Player.LastName,
		}
	}

	if m.AttendanceStatus.ID != 0 {
		record.AttendanceStatus = &domain.StatusRef{
			ID:    m.AttendanceStatus.ID,
			Name:  m.AttendanceStatus.Name,
			Code:  m.AttendanceStatus.Code,
			Color: m.AttendanceStatus.Color,
		}
	}

	if m.RecordedByCoach.ID != 0 {
		record.RecordedByCoach = &domain.CoachRef{
			ID:        m.RecordedByCoach.ID,
			FirstName: m.RecordedByCoach.FirstName,
			LastName:  m.RecordedByCoach.LastName,
		}
	}

	return record
}
