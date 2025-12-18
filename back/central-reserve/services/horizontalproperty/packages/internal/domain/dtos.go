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
	Page            int
	PageSize        int
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
	ResidentName       string
	StatusName         string
	StatusCode         string
	ReceivedAt         *time.Time
	DeliveredAt        *time.Time
	CreatedAt          time.Time
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
