package domain

import "context"

// PropertyUnitRepository - Puerto para repositorio de unidades de propiedad
type PropertyUnitRepository interface {
	CreatePropertyUnit(ctx context.Context, unit *PropertyUnit) (*PropertyUnit, error)
	GetPropertyUnitByID(ctx context.Context, id uint) (*PropertyUnit, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)
	UpdatePropertyUnit(ctx context.Context, id uint, unit *PropertyUnit) (*PropertyUnit, error)
	DeletePropertyUnit(ctx context.Context, id uint) error
	ExistsPropertyUnitByNumber(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error)
}

// PropertyUnitUseCase - Puerto para casos de uso de unidades de propiedad
type PropertyUnitUseCase interface {
	CreatePropertyUnit(ctx context.Context, dto CreatePropertyUnitDTO) (*PropertyUnitDetailDTO, error)
	GetPropertyUnitByID(ctx context.Context, id uint) (*PropertyUnitDetailDTO, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)
	UpdatePropertyUnit(ctx context.Context, id uint, dto UpdatePropertyUnitDTO) (*PropertyUnitDetailDTO, error)
	DeletePropertyUnit(ctx context.Context, id uint) error
	ImportPropertyUnitsFromExcel(ctx context.Context, businessID uint, filePath string) (*ImportPropertyUnitsResult, error)
}
