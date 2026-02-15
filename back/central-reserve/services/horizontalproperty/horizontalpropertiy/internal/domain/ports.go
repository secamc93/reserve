package domain

import (
	"context"

	"central_reserve/shared/types"
)

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY PORTS (Interfaces)
//
// ═══════════════════════════════════════════════════════════════════

// FileStoragePort - Puerto para operaciones de almacenamiento de archivos
// Esta interfaz es definida por el dominio según sus necesidades
type FileStoragePort interface {
	UploadImage(ctx context.Context, file *types.FileUpload, folder string) (string, error)
	DeleteImage(ctx context.Context, filename string) error
	GetImageURL(filename string) string
	ImageExists(ctx context.Context, filename string) (bool, error)
}

// HorizontalPropertyRepository - Puerto para el repositorio consolidado de propiedades horizontales
type HorizontalPropertyRepository interface {
	// Métodos para propiedades horizontales
	CreateHorizontalProperty(ctx context.Context, property *HorizontalProperty) (*HorizontalProperty, error)
	GetHorizontalPropertyByID(ctx context.Context, id uint) (*HorizontalProperty, error)
	UpdateHorizontalProperty(ctx context.Context, id uint, property *HorizontalProperty) (*HorizontalProperty, error)
	DeleteHorizontalProperty(ctx context.Context, id uint) error
	ListHorizontalProperties(ctx context.Context, filters HorizontalPropertyFiltersDTO) (*PaginatedHorizontalPropertyDTO, error)
	ExistsHorizontalPropertyByCode(ctx context.Context, code string, excludeID *uint) (bool, error)
	ExistsCustomDomain(ctx context.Context, customDomain string, excludeID *uint) (bool, error)
	ParentBusinessExists(ctx context.Context, parentBusinessID uint) (bool, error)

	// Métodos para tipos de negocio
	// Métodos para tipos de negocio
	GetBusinessTypeByID(ctx context.Context, id uint) (*BusinessType, error)
	GetHorizontalPropertyType(ctx context.Context) (*BusinessType, error)

	// Métodos para configuración inicial (setup)
	CreatePropertyUnits(ctx context.Context, businessID uint, units []PropertyUnitCreate) error
	CreateRequiredCommittees(ctx context.Context, businessID uint) error
	GetRequiredCommitteeTypes(ctx context.Context) ([]CommitteeTypeInfo, error)
}

// PropertyUnitCreate - DTO para crear unidades en bulk
type PropertyUnitCreate struct {
	Number      string
	Floor       *int
	Block       string
	UnitType    string
	Description string
}

// CommitteeTypeInfo - Info de tipos de comités requeridos
type CommitteeTypeInfo struct {
	ID                 uint
	Code               string
	Name               string
	TermDurationMonths *int
}

// HorizontalPropertyUseCase - Puerto para los casos de uso de propiedades horizontales
type HorizontalPropertyUseCase interface {
	CreateHorizontalProperty(ctx context.Context, dto CreateHorizontalPropertyDTO) (*HorizontalPropertyDTO, error)
	GetHorizontalPropertyByID(ctx context.Context, id uint) (*HorizontalPropertyDTO, error)
	UpdateHorizontalProperty(ctx context.Context, id uint, dto UpdateHorizontalPropertyDTO) (*HorizontalPropertyDTO, error)
	DeleteHorizontalProperty(ctx context.Context, id uint) error
	ListHorizontalProperties(ctx context.Context, filters HorizontalPropertyFiltersDTO) (*PaginatedHorizontalPropertyDTO, error)
}
