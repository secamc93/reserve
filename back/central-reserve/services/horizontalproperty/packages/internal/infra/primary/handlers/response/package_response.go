package response

import "time"

// PackageResponse - Respuesta de paquete
type PackageResponse struct {
	Success bool        `json:"success"`
	Data    PackageData `json:"data"`
}

// PackageData - Datos del paquete
type PackageData struct {
	ID                 uint       `json:"id"`
	BusinessID         uint       `json:"business_id"`
	PropertyUnitID     uint       `json:"property_unit_id"`
	ResidentID         *uint      `json:"resident_id"`
	PackageStatusID    uint       `json:"package_status_id"`
	Carrier            string     `json:"carrier"`
	TrackingNumber     string     `json:"tracking_number"`
	QRCode             string     `json:"qr_code"`
	ReceivedByUserID   *uint      `json:"received_by_user_id"`
	ReceivedAt         *time.Time `json:"received_at"`
	DeliveredByUserID  *uint      `json:"delivered_by_user_id"`
	DeliveredAt        *time.Time `json:"delivered_at"`
	Description        string     `json:"description"`
	Notes              string     `json:"notes"`
	NotifyResident     bool       `json:"notify_resident"`
	NotificationSentAt *time.Time `json:"notification_sent_at"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	// Relaciones
	PropertyUnitNumber string `json:"property_unit_number,omitempty"`
	ResidentName       string `json:"resident_name,omitempty"`
	StatusName         string `json:"status_name,omitempty"`
	StatusCode         string `json:"status_code,omitempty"`
}

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// PackageListData - Datos de paquete para lista
type PackageListData struct {
	ID                 uint       `json:"id"`
	TrackingNumber     string     `json:"tracking_number"`
	Carrier            string     `json:"carrier"`
	PropertyUnitNumber string     `json:"property_unit_number"`
	ResidentName       string     `json:"resident_name"`
	StatusName         string     `json:"status_name"`
	StatusCode         string     `json:"status_code"`
	ReceivedAt         *time.Time `json:"received_at"`
	DeliveredAt        *time.Time `json:"delivered_at"`
	CreatedAt          time.Time  `json:"created_at"`
}

// PaginatedPackagesResponse - Respuesta paginada de paquetes
type PaginatedPackagesResponse struct {
	Success    bool              `json:"success"`
	Data       []PackageListData `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}
