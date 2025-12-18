package response

import "time"

// VisitorResponse - Respuesta de visitante
type VisitorResponse struct {
	Success bool        `json:"success"`
	Data    VisitorData `json:"data"`
}

// VisitorData - Datos del visitante
type VisitorData struct {
	ID           uint   `json:"id"`
	BusinessID   *uint  `json:"business_id"`
	DNI          string `json:"dni"`
	FullName     string `json:"full_name"`
	Phone        string `json:"phone"`
	Email        string `json:"email"`
	PhotoURL     string `json:"photo_url"`
	HasBlacklist bool   `json:"has_blacklist"`
	IsVerified   bool   `json:"is_verified"`
	TotalVisits  int    `json:"total_visits"`
}

// VisitResponse - Respuesta de visita
type VisitResponse struct {
	Success bool      `json:"success"`
	Data    VisitData `json:"data"`
}

// VisitData - Datos de la visita
type VisitData struct {
	ID                 uint       `json:"id"`
	BusinessID         uint       `json:"business_id"`
	VisitorID          uint       `json:"visitor_id"`
	PropertyUnitID     uint       `json:"property_unit_id"`
	ResidentID         *uint      `json:"resident_id"`
	VisitTypeID        uint       `json:"visit_type_id"`
	VisitStatusID      uint       `json:"visit_status_id"`
	ScheduledDate      time.Time  `json:"scheduled_date"`
	ScheduledStartTime time.Time  `json:"scheduled_start_time"`
	ScheduledEndTime   *time.Time `json:"scheduled_end_time"`
	ActualEntryTime    *time.Time `json:"actual_entry_time"`
	ActualExitTime     *time.Time `json:"actual_exit_time"`
	AuthorizationCode  string     `json:"authorization_code"`
	QRCode             string     `json:"qr_code"`
	Purpose            string     `json:"purpose"`
	Notes              string     `json:"notes"`
}

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// VisitListData - Datos de visita para lista
type VisitListData struct {
	ID                 uint       `json:"id"`
	VisitorName        string     `json:"visitor_name"`
	VisitorDNI         string     `json:"visitor_dni"`
	PropertyUnitNumber string     `json:"property_unit_number"`
	VisitTypeName      string     `json:"visit_type_name"`
	VisitStatusName    string     `json:"visit_status_name"`
	ScheduledDate      time.Time  `json:"scheduled_date"`
	ActualEntryTime    *time.Time `json:"actual_entry_time"`
	ActualExitTime     *time.Time `json:"actual_exit_time"`
	CreatedAt          time.Time  `json:"created_at"`
}

// PaginatedVisitsResponse - Respuesta paginada de visitas
type PaginatedVisitsResponse struct {
	Success    bool            `json:"success"`
	Data       []VisitListData `json:"data"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}
