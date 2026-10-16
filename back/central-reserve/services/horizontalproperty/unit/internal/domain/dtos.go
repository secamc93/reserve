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
	// Commercial: unidades de tipo local comercial.
	Commercial int64
	Blocks     []PropertyUnitBlockSummaryDTO
}

// PropertyUnitFiltersDTO - DTO para filtros de búsqueda
type PropertyUnitFiltersDTO struct {
	BusinessID uint
	Number     string
	UnitType   string
	Floor      *int
	Block      string
	IsActive   *bool
	// Query busca por número de unidad o por nombre de un residente de la unidad.
	Query string
	// WithoutResidents: true = solo unidades sin residentes; false = solo con residentes.
	WithoutResidents *bool
	// GroupByBlock ordena primero por bloque (para agrupar las filas por bloque/torre).
	GroupByBlock bool
	Page         int
	PageSize     int
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
	Updated int
	Skipped int
	Errors  []string
}

// ImportOptions - Opciones de la importación de unidades
type ImportOptions struct {
	// UpdateExisting: las filas cuyo número ya existe actualizan la unidad (si no, se omiten).
	UpdateExisting bool
}

// ExistingUnitDTO - Unidad existente (para cruzar con el archivo importado)
type ExistingUnitDTO struct {
	ID          uint
	Number      string
	Coefficient float64
}

// Estados de una fila del archivo de importación
const (
	ImportRowReady              = "ready"               // lista para crear
	ImportRowExists             = "exists"              // el número ya existe (se actualiza o se omite)
	ImportRowEmptyNumber        = "empty_number"        // número vacío
	ImportRowDuplicate          = "duplicate"           // número repetido dentro del archivo
	ImportRowEmptyCoefficient   = "empty_coefficient"   // coeficiente vacío
	ImportRowInvalidCoefficient = "invalid_coefficient" // coeficiente no numérico o <= 0
	ImportRowUnknownType        = "unknown_type"        // tipo de unidad no reconocido
	ImportRowInvalidFloor       = "invalid_floor"       // piso no numérico
)

// ImportRowDTO - Una fila del archivo con su estado
type ImportRowDTO struct {
	Row         int // número de fila en el archivo (1 = encabezado)
	Number      string
	Block       string
	Floor       *int
	UnitType    string
	Coefficient *float64
	Status      string
	Message     string
	DuplicateOf int // fila donde apareció primero el número (estado duplicate)
}

// IsError indica si la fila no se puede importar
func (r ImportRowDTO) IsError() bool {
	return r.Status != ImportRowReady && r.Status != ImportRowExists
}

// ImportPreviewDTO - Vista previa de una importación (no guarda nada)
type ImportPreviewDTO struct {
	Columns  int
	Rows     []ImportRowDTO
	Ready    int // filas nuevas listas
	Existing int // filas cuyo número ya existe
	Errors   int // filas con error
	// CoefficientTotal: suma de coeficientes de la propiedad si se importa el archivo
	// actualizando las existentes (unidades del archivo + unidades que no están en él).
	CoefficientTotal float64
}
