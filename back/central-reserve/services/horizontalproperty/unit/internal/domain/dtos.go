package domain

import "time"

// CreatePropertyUnitDTO - DTO para crear unidad de propiedad
type CreatePropertyUnitDTO struct {
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
}

// UpdatePropertyUnitDTO - DTO para actualizar unidad de propiedad
type UpdatePropertyUnitDTO struct {
	Number                   *string
	Floor                    *int
	Block                    *string
	UnitType                 *string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              *string
	IsActive                 *bool
}

// PropertyUnitDetailDTO - DTO para respuesta detallada de unidad
type PropertyUnitDetailDTO struct {
	ID                       uint
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
	IsActive                 bool
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

// PropertyUnitListDTO - DTO para listado de unidades
type PropertyUnitListDTO struct {
	ID                       uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	IsActive                 bool
	// Ocupación (consulta de solo lectura a residents / resident_units)
	ResidentsCount   int
	MainResidentName string
}

// PropertyUnitBlockSummaryDTO - Totales de un bloque/torre (Casa, Dúplex, Torre A...)
type PropertyUnitBlockSummaryDTO struct {
	Block          string
	Total          int64
	Active         int64
	CoefficientSum float64
}

// PropertyUnitsSummaryDTO - Resumen de las unidades de una propiedad: totales, suma de
// coeficientes y agrupación por bloque.
type PropertyUnitsSummaryDTO struct {
	Total          int64
	Active         int64
	WithResidents  int64
	CoefficientSum float64
	Blocks         []PropertyUnitBlockSummaryDTO
}

// PropertyUnitFiltersDTO - DTO para filtros de búsqueda
type PropertyUnitFiltersDTO struct {
	BusinessID uint
	Number     string
	UnitType   string
	Floor      *int
	Block      string
	IsActive   *bool
	Page       int
	PageSize   int
}

// PaginatedPropertyUnitsDTO - DTO para respuesta paginada
type PaginatedPropertyUnitsDTO struct {
	Units      []PropertyUnitListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// ImportPropertyUnitsResult - Resultado de la importación de unidades
type ImportPropertyUnitsResult struct {
	Total   int
	Created int
	Skipped int
	Errors  []string
}
