package request

// ReceivePackageRequest - Request para recibir paquete
type ReceivePackageRequest struct {
	PropertyUnitID uint   `json:"property_unit_id" binding:"required"`
	ResidentID     *uint  `json:"resident_id"`
	Carrier        string `json:"carrier" binding:"required"`
	TrackingNumber string `json:"tracking_number" binding:"required"`
	Description    string `json:"description"`
	Notes          string `json:"notes"`
	NotifyResident bool   `json:"notify_resident"`
}

// DeliverPackageRequest - Request para entregar paquete
type DeliverPackageRequest struct {
	Notes string `json:"notes"`
}

// UpdatePackageStatusRequest - Request para actualizar estado
type UpdatePackageStatusRequest struct {
	PackageStatusID uint   `json:"package_status_id" binding:"required"`
	Notes           string `json:"notes"`
}
