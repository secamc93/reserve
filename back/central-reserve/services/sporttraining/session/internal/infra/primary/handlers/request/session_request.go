package request

// CreateSessionRequest - Request para crear sesión
type CreateSessionRequest struct {
	TrainingSessionTypeID uint     `json:"training_session_type_id" binding:"required"`
	CoachID               uint     `json:"coach_id" binding:"required"`
	TrainingGroupID       *uint    `json:"training_group_id"`
	SessionMode           string   `json:"session_mode" binding:"required"`
	ScheduledDate         string   `json:"scheduled_date" binding:"required"` // YYYY-MM-DD
	StartTime             string   `json:"start_time" binding:"required"`     // HH:MM
	EndTime               string   `json:"end_time" binding:"required"`       // HH:MM
	Duration              int      `json:"duration" binding:"required"`
	Location              string   `json:"location"`
	Field                 string   `json:"field"`
	MaxParticipants       *int     `json:"max_participants"`
	Price                 *float64 `json:"price"`
	IsRecurring           bool     `json:"is_recurring"`
	CoachNotes            string   `json:"coach_notes"`
	PublicNotes           string   `json:"public_notes"`
}

// UpdateSessionRequest - Request para actualizar sesión
type UpdateSessionRequest struct {
	TrainingSessionTypeID uint     `json:"training_session_type_id" binding:"required"`
	CoachID               uint     `json:"coach_id" binding:"required"`
	TrainingGroupID       *uint    `json:"training_group_id"`
	SessionMode           string   `json:"session_mode" binding:"required"`
	ScheduledDate         string   `json:"scheduled_date" binding:"required"` // YYYY-MM-DD
	StartTime             string   `json:"start_time" binding:"required"`     // HH:MM
	EndTime               string   `json:"end_time" binding:"required"`       // HH:MM
	Duration              int      `json:"duration" binding:"required"`
	Location              string   `json:"location"`
	Field                 string   `json:"field"`
	MaxParticipants       *int     `json:"max_participants"`
	Price                 *float64 `json:"price"`
	IsRecurring           bool     `json:"is_recurring"`
	CoachNotes            string   `json:"coach_notes"`
	PublicNotes           string   `json:"public_notes"`
}

// CancelSessionRequest - Request para cancelar sesión
type CancelSessionRequest struct {
	Reason string `json:"reason" binding:"required"`
}
