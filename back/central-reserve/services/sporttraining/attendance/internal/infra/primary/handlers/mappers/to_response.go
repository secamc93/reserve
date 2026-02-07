package mappers

import (
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers/response"
)

// AttendanceToResponse mapea entidad de dominio a response HTTP
func AttendanceToResponse(a *domain.AttendanceRecord) response.AttendanceData {
	data := response.AttendanceData{
		ID:                a.ID,
		TrainingSessionID: a.TrainingSessionID,
		PlayerID:          a.PlayerID,
		AttendanceStatusID: a.AttendanceStatusID,
		CheckInTime:       a.CheckInTime,
		CheckOutTime:      a.CheckOutTime,
		RecordedByCoachID: a.RecordedByCoachID,
		RecordedAt:        a.RecordedAt,
		PerformanceRating: a.PerformanceRating,
		CoachFeedback:     a.CoachFeedback,
		PlayerNotes:       a.PlayerNotes,
		CreatedAt:         a.CreatedAt,
		UpdatedAt:         a.UpdatedAt,
	}

	if a.Player != nil {
		data.PlayerName = a.Player.FirstName + " " + a.Player.LastName
	}

	if a.AttendanceStatus != nil {
		data.StatusName = a.AttendanceStatus.Name
		data.StatusCode = a.AttendanceStatus.Code
		data.StatusColor = a.AttendanceStatus.Color
	}

	if a.RecordedByCoach != nil {
		data.RecordedByCoachName = a.RecordedByCoach.FirstName + " " + a.RecordedByCoach.LastName
	}

	return data
}
