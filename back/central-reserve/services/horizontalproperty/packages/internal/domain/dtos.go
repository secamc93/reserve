package domain

import "time"

// CreatePackageDTO - DTO para crear paquete
type CreatePackageDTO struct {
	BusinessID       uint
	PropertyUnitID   uint
	ResidentID       *uint
	Carrier          string
	TrackingNumber   string
	Description      string
	Notes            string
	NotifyResident   bool
	ReceivedByUserID uint
}

// PackageFiltersDTO - Filtros para listar paquetes
type PackageFiltersDTO struct {
	BusinessID      uint
	PropertyUnitID  *uint
	ResidentID      *uint
	PackageStatusID *uint
	StartDate       *time.Time
	EndDate         *time.Time
	// StatusGroup agrupa estados: "pending" (por entregar), "delivered" o "closed" (devueltos/perdidos).
	// Vacío = todos. Ver PackageStatusGroups.
	StatusGroup string
	// Search busca por guía, transportadora, número de unidad o nombre del residente.
	Search   string
	Page     int
	PageSize int
}

// PaginatedPackagesDTO - Resultado paginado de paquetes
type PaginatedPackagesDTO struct {
	Packages   []PackageListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// PackageListDTO - DTO para lista de paquetes
type PackageListDTO struct {
	ID                 uint
	TrackingNumber     string
	Carrier            string
	PropertyUnitNumber string
	PropertyUnitBlock  string
	ResidentName       string
	StatusName         string
	StatusCode         string
	Description        string
	ReceivedAt         *time.Time
	DeliveredAt        *time.Time
	CreatedAt          time.Time
}

// PackagesSummaryDTO - Conteos de la portería de paquetes (chips de la lista)
type PackagesSummaryDTO struct {
	Pending        int64 // por entregar (received, in_storage, notified)
	PendingOverdue int64 // por entregar recibidos hace más de PackageOverdueAfter
	DeliveredToday int64 // entregados hoy (hora de Colombia)
	Delivered      int64 // entregados (todos)
	Closed         int64 // devueltos o perdidos
	Total          int64
}

// DeliverPackageDTO - DTO para entregar paquete
type DeliverPackageDTO struct {
	PackageID         uint
	DeliveredByUserID uint
	Notes             string
}

// UpdatePackageStatusDTO - DTO para actualizar estado
type UpdatePackageStatusDTO struct {
	PackageID       uint
	PackageStatusID uint
	UpdatedByUserID uint
	Notes           string
}
