package request

import "time"

// RecordAttendanceRequest - Request para registrar asistencia
type RecordAttendanceRequest struct {
	PlayerID           uint       `json:"player_id" binding:"required"`
	AttendanceStatusID uint       `json:"attendance_status_id" binding:"required"`
	CheckInTime        *time.Time `json:"check_in_time"`
	PerformanceRating  *int       `json:"performance_rating"`
	CoachFeedback      string     `json:"coach_feedback"`
	PlayerNotes        string     `json:"player_notes"`
}
