package request

import "time"

// CreateVisitRequest - Request para crear visita
type CreateVisitRequest struct {
	VisitorID          uint       `json:"visitor_id" binding:"required"`
	PropertyUnitID     uint       `json:"property_unit_id" binding:"required"`
	ResidentID         *uint      `json:"resident_id"`
	VisitTypeID        uint       `json:"visit_type_id" binding:"required"`
	VisitorVehicleID   *uint      `json:"visitor_vehicle_id"`
	ScheduledDate      time.Time  `json:"scheduled_date" binding:"required"`
	ScheduledStartTime time.Time  `json:"scheduled_start_time" binding:"required"`
	ScheduledEndTime   *time.Time `json:"scheduled_end_time"`
	Purpose            string     `json:"purpose"`
	NumberOfVisitors   int        `json:"number_of_visitors"`
	HasCompanions      bool       `json:"has_companions"`
	HasAssets          bool       `json:"has_assets"`
	Notes              string     `json:"notes"`
	NotifyResident     bool       `json:"notify_resident"`
	NotifySecurity     bool       `json:"notify_security"`
}

// RegisterEntryRequest - Request para registrar entrada
type RegisterEntryRequest struct {
	Gate   string `json:"gate" binding:"required"`
	Method string `json:"method" binding:"required"` // qr_code, manual, ocr, lpr
}

// RegisterExitRequest - Request para registrar salida
type RegisterExitRequest struct {
	Gate string `json:"gate" binding:"required"`
}

// RegisterAssetsRequest - Request para registrar activos
type RegisterAssetsRequest struct {
	Assets []CreateAssetRequest `json:"assets" binding:"required"`
}

// CreateAssetRequest - Request para crear activo
type CreateAssetRequest struct {
	AssetName        string `json:"asset_name" binding:"required"`
	AssetDescription string `json:"asset_description"`
	AssetSerial      string `json:"asset_serial"`
	AssetBrand       string `json:"asset_brand"`
}

// CreateVisitorRequest - Request para crear visitante
type CreateVisitorRequest struct {
	DNI      string `json:"dni" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Email    string `json:"email"`
}

// UpdateVisitRequest - Request para actualizar visita
type UpdateVisitRequest struct {
	PropertyUnitID     *uint      `json:"property_unit_id"`
	ResidentID         *uint      `json:"resident_id"`
	VisitTypeID        *uint      `json:"visit_type_id"`
	ScheduledDate      *time.Time `json:"scheduled_date"`
	ScheduledStartTime *time.Time `json:"scheduled_start_time"`
	ScheduledEndTime   *time.Time `json:"scheduled_end_time"`
	Purpose            *string    `json:"purpose"`
	NumberOfVisitors   *int       `json:"number_of_visitors"`
	Notes              *string    `json:"notes"`
	NotifyResident     *bool      `json:"notify_resident"`
	NotifySecurity     *bool      `json:"notify_security"`
}

// CreateCompanionRequest - Request para crear acompañante
type CreateCompanionRequest struct {
	CompanionName  string `json:"companion_name" binding:"required"`
	CompanionDNI   string `json:"companion_dni" binding:"required"`
	CompanionPhone string `json:"companion_phone"`
	IsMinor        bool   `json:"is_minor"`
	Relationship   string `json:"relationship"`
	Notes          string `json:"notes"`
}
