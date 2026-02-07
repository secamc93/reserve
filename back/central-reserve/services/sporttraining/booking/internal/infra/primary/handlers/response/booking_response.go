package response

import "time"

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SuccessResponse - Respuesta genérica de éxito
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// BookingResponse - Respuesta de reserva
type BookingResponse struct {
	Success bool        `json:"success"`
	Data    BookingData `json:"data"`
}

// BookingData - Datos completos de la reserva
type BookingData struct {
	ID                 uint        `json:"id"`
	TrainingSessionID  uint        `json:"training_session_id"`
	PlayerID           uint        `json:"player_id"`
	BookedByUserID     uint        `json:"booked_by_user_id"`
	BookingStatusID    uint        `json:"booking_status_id"`
	BookingDate        time.Time   `json:"booking_date"`
	RequestNotes       string      `json:"request_notes"`
	ReviewedAt         *time.Time  `json:"reviewed_at"`
	ReviewedByCoachID  *uint       `json:"reviewed_by_coach_id"`
	ResponseNotes      string      `json:"response_notes"`
	CancelledAt        *time.Time  `json:"cancelled_at"`
	CancelledByUserID  *uint       `json:"cancelled_by_user_id"`
	CancellationReason string      `json:"cancellation_reason"`
	Price              *float64    `json:"price"`
	IsPaid             bool        `json:"is_paid"`
	PaymentDate        *time.Time  `json:"payment_date"`
	PaymentMethod      string      `json:"payment_method"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
	Session            *SessionRef `json:"session,omitempty"`
	Player             *PlayerRef  `json:"player,omitempty"`
	Status             *StatusRef  `json:"status,omitempty"`
}

// SessionRef - Referencia de sesión
type SessionRef struct {
	ID            uint      `json:"id"`
	ScheduledDate time.Time `json:"scheduled_date"`
	SessionMode   string    `json:"session_mode"`
	Location      string    `json:"location"`
}

// PlayerRef - Referencia de jugador
type PlayerRef struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// StatusRef - Referencia de estado
type StatusRef struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Code    string `json:"code"`
	Color   string `json:"color"`
	IsFinal bool   `json:"is_final"`
}

// BookingListData - Datos de reserva para lista
type BookingListData struct {
	ID                uint      `json:"id"`
	TrainingSessionID uint      `json:"training_session_id"`
	PlayerID          uint      `json:"player_id"`
	PlayerName        string    `json:"player_name"`
	SessionDate       time.Time `json:"session_date"`
	SessionMode       string    `json:"session_mode"`
	Location          string    `json:"location"`
	StatusName        string    `json:"status_name"`
	StatusCode        string    `json:"status_code"`
	StatusColor       string    `json:"status_color"`
	BookingDate       time.Time `json:"booking_date"`
	IsPaid            bool      `json:"is_paid"`
	Price             *float64  `json:"price"`
	CreatedAt         time.Time `json:"created_at"`
}

// PaginatedBookingsResponse - Respuesta paginada de reservas
type PaginatedBookingsResponse struct {
	Success    bool              `json:"success"`
	Data       []BookingListData `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}
