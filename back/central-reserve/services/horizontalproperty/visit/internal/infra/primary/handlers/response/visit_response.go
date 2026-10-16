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
	ID                  uint       `json:"id"`
	VisitorName         string     `json:"visitor_name"`
	VisitorDNI          string     `json:"visitor_dni"`
	VisitorPhone        string     `json:"visitor_phone"`
	PropertyUnitNumber  string     `json:"property_unit_number"`
	PropertyUnitBlock   string     `json:"property_unit_block"`
	VisitTypeName       string     `json:"visit_type_name"`
	VisitStatusName     string     `json:"visit_status_name"`
	VisitStatusCode     string     `json:"visit_status_code"`
	ScheduledDate       time.Time  `json:"scheduled_date"`
	ScheduledStartTime  time.Time  `json:"scheduled_start_time"`
	ScheduledEndTime    *time.Time `json:"scheduled_end_time"`
	ActualEntryTime     *time.Time `json:"actual_entry_time"`
	ActualExitTime      *time.Time `json:"actual_exit_time"`
	Purpose             string     `json:"purpose"`
	NumberOfVisitors    int        `json:"number_of_visitors"`
	CreatedAt           time.Time  `json:"created_at"`
	VisitorVehiclePlate string     `json:"visitor_vehicle_plate"`
	AuthorizationCode   string     `json:"authorization_code"`
	EntryGate           string     `json:"entry_gate"`
	ResidentName        string     `json:"resident_name"`
	AuthorizedByName    string     `json:"authorized_by_name"`
	StayLimitMinutes    *int       `json:"stay_limit_minutes"`
	ExceedsTime         bool       `json:"exceeds_time"`
}

// VisitsSummaryData - Conteos de visitas de un día por estado de portería
type VisitsSummaryData struct {
	Date      string `json:"date"`
	Inside    int64  `json:"inside"`
	Expected  int64  `json:"expected"`
	Left      int64  `json:"left"`
	Cancelled int64  `json:"cancelled"`
	Total     int64  `json:"total"`
	InsideNow int64  `json:"inside_now"`
	// Tarjetas del día
	Exceeded       int64      `json:"exceeded"`
	NextExpectedAt *time.Time `json:"next_expected_at"`
	NextUnitNumber string     `json:"next_unit_number"`
	NextUnitBlock  string     `json:"next_unit_block"`
	AvgStayMinutes *int       `json:"avg_stay_minutes"`
}

// VisitAssetData - Activo declarado de una visita
type VisitAssetData struct {
	ID               uint       `json:"id"`
	AssetName        string     `json:"asset_name"`
	AssetDescription string     `json:"asset_description"`
	AssetSerial      string     `json:"asset_serial"`
	AssetBrand       string     `json:"asset_brand"`
	EntryRegistered  bool       `json:"entry_registered"`
	ExitRegistered   bool       `json:"exit_registered"`
	ExitRegisteredAt *time.Time `json:"exit_registered_at"`
}

// VisitAssetsResponse - Activos de una visita
type VisitAssetsResponse struct {
	Success bool             `json:"success"`
	Data    []VisitAssetData `json:"data"`
}

// VisitorVehicleData - Vehículo de un visitante
type VisitorVehicleData struct {
	ID        uint   `json:"id"`
	VisitorID *uint  `json:"visitor_id"`
	Plate     string `json:"plate"`
	Brand     string `json:"brand"`
	Color     string `json:"color"`
}

// VisitorVehicleResponse - Respuesta al registrar un vehículo
type VisitorVehicleResponse struct {
	Success bool               `json:"success"`
	Data    VisitorVehicleData `json:"data"`
}

// VisitsSummaryResponse - Respuesta del resumen de visitas
type VisitsSummaryResponse struct {
	Success bool              `json:"success"`
	Data    VisitsSummaryData `json:"data"`
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

// VisitTypeData - Datos de tipo de visita
type VisitTypeData struct {
	ID                          uint   `json:"id"`
	Name                        string `json:"name"`
	Code                        string `json:"code"`
	Description                 string `json:"description"`
	RequiresAuthorization       bool   `json:"requires_authorization"`
	RequiresVehicleRegistration bool   `json:"requires_vehicle_registration"`
	RequiresCompanions          bool   `json:"requires_companions"`
	RequiresAssetsTracking      bool   `json:"requires_assets_tracking"`
	MaxDurationHours            *int   `json:"max_duration_hours"`
	DefaultDurationMinutes      *int   `json:"default_duration_minutes"`
	IsActive                    bool   `json:"is_active"`
}

// VisitTypesResponse - Respuesta de tipos de visita
type VisitTypesResponse struct {
	Success bool            `json:"success"`
	Data    []VisitTypeData `json:"data"`
}

// VisitStatusData - Datos de estado de visita
type VisitStatusData struct {
	ID          uint   `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsFinal     bool   `json:"is_final"`
	IsActive    bool   `json:"is_active"`
}

// VisitStatusesResponse - Respuesta de estados de visita
type VisitStatusesResponse struct {
	Success bool              `json:"success"`
	Data    []VisitStatusData `json:"data"`
}

// CompanionData - Datos de acompañante
type CompanionData struct {
	ID             uint   `json:"id"`
	VisitID        uint   `json:"visit_id"`
	CompanionName  string `json:"companion_name"`
	CompanionDNI   string `json:"companion_dni"`
	CompanionPhone string `json:"companion_phone"`
	IsMinor        bool   `json:"is_minor"`
	Relationship   string `json:"relationship"`
	Notes          string `json:"notes"`
}

// CompanionResponse - Respuesta de acompañante
type CompanionResponse struct {
	Success bool          `json:"success"`
	Data    CompanionData `json:"data"`
}

// CompanionsResponse - Respuesta de lista de acompañantes
type CompanionsResponse struct {
	Success bool            `json:"success"`
	Data    []CompanionData `json:"data"`
}

// SuccessResponse - Respuesta de éxito genérica
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
