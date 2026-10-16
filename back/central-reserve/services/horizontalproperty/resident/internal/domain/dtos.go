package domain

import "time"

// ───────────────────────────────────────────
// RESIDENT DTOs
// ───────────────────────────────────────────

// ImportResidentsResult - Resultado de la importación de residentes
type ImportResidentsResult struct {
	Total   int
	Created int
	Errors  []string
}

// ResidentBasicDTO - DTO básico de residente para validación pública
type ResidentBasicDTO struct {
	ID                 uint
	Name               string
	PropertyUnitID     uint
	PropertyUnitNumber string
}

// CreateResidentDTO - DTO para crear residente
type CreateResidentDTO struct {
	BusinessID       uint
	PropertyUnitID   uint
	ResidentTypeID   uint
	Name             string
	Email            string
	Phone            string
	Dni              string
	EmergencyContact string
	IsMainResident   bool
	MoveInDate       *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
	AllowEmptyDni    bool
}

// UpdateResidentDTO - DTO para actualizar residente
type UpdateResidentDTO struct {
	PropertyUnitID   *uint
	ResidentTypeID   *uint
	Name             *string
	Email            *string
	Phone            *string
	Dni              *string
	EmergencyContact *string
	IsMainResident   *bool
	IsActive         *bool
	MoveInDate       *time.Time
	MoveOutDate      *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
}

// ResidentDetailDTO - DTO para respuesta detallada de residente
type ResidentDetailDTO struct {
	ID                 uint
	BusinessID         uint
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentTypeID     uint
	ResidentTypeName   string
	ResidentTypeCode   string
	Name               string
	Email              string
	Phone              string
	Dni                string
	EmergencyContact   string
	IsMainResident     bool
	IsActive           bool
	MoveInDate         *time.Time
	MoveOutDate        *time.Time
	LeaseStartDate     *time.Time
	LeaseEndDate       *time.Time
	MonthlyRent        *float64
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

// ResidentListDTO - DTO para listado de residentes
type ResidentListDTO struct {
	ID                 uint
	PropertyUnitNumber string
	PropertyUnitBlock  string // Bloque de la unidad mostrada ("Casa", "Torre A")
	Dni                string
	Since              *time.Time // Desde cuándo vive (ingreso a la unidad o registro)
	ResidentTypeName   string
	Name               string
	Email              string
	Phone              string
	IsMainResident     bool
	IsActive           bool
}

// ResidentTypeCountDTO - Residentes de un tipo (Propietario, Arrendatario...)
type ResidentTypeCountDTO struct {
	ResidentTypeID uint
	Name           string
	Code           string
	Total          int64
}

// ResidentsSummaryDTO - Totales de residentes de una propiedad y conteo por tipo
// (incluye los tipos activos sin residentes, con total 0).
type ResidentsSummaryDTO struct {
	Total    int64
	Active   int64
	Inactive int64
	Main     int64
	// WithoutEmail: residentes sin correo registrado.
	WithoutEmail int64
	Types        []ResidentTypeCountDTO
}

// ResidentFiltersDTO - DTO para filtros de búsqueda
type ResidentFiltersDTO struct {
	BusinessID         uint
	PropertyUnitNumber string
	Name               string
	Dni                string
	PropertyUnitID     *uint
	ResidentTypeID     *uint
	IsActive           *bool
	IsMainResident     *bool
	// Query busca por nombre, documento o número de unidad.
	Query string
	// Block filtra por el bloque/torre de la unidad.
	Block string
	// WithoutEmail: true = sin correo; false = con correo.
	WithoutEmail *bool
	Page         int
	PageSize     int
}

// PaginatedResidentsDTO - DTO para respuesta paginada
type PaginatedResidentsDTO struct {
	Residents  []ResidentListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// BulkUpdateResidentItem - DTO para un residente en edición masiva
type BulkUpdateResidentItem struct {
	PropertyUnitNumber string
	Name               *string
	Dni                *string
}

// BulkUpdateResidentsRequest - DTO para solicitud de edición masiva
type BulkUpdateResidentsRequest struct {
	Residents []BulkUpdateResidentItem
}

// BulkUpdateResidentsResult - DTO para resultado de edición masiva
type BulkUpdateResidentsResult struct {
	TotalProcessed int
	Updated        int
	Errors         int
	ErrorDetails   []BulkUpdateErrorDetail
}

// BulkUpdateErrorDetail detalla un error por fila/unidad para graficar en frontend
type BulkUpdateErrorDetail struct {
	Row                int
	PropertyUnitNumber string
	Error              string
}

// ResidentUpdatePair representa una actualización a aplicar en batch
type ResidentUpdatePair struct {
	ID        uint
	UpdateDTO UpdateResidentDTO
}

// ResidentOverviewStatsDTO - Cifras del residente (de sus unidades)
type ResidentOverviewStatsDTO struct {
	Visits30d       int64 // visitas de los últimos 30 días
	PackagesPending int64 // paquetes sin entregar
	Reservations    int64 // reservas de zonas comunes desde hoy
	VotesCast       int64 // votaciones del último grupo en que votaron sus unidades
	VotesTotal      int64 // votaciones del último grupo de votación de la propiedad
}

// HousemateDTO - Otro residente de la misma unidad
type HousemateDTO struct {
	ID       uint
	Name     string
	TypeName string
	IsMain   bool
}

// Tipos de actividad reciente
const (
	ActivityPackage     = "package"
	ActivityVisit       = "visit"
	ActivityReservation = "reservation"
	ActivityVote        = "vote"
	ActivityParking     = "parking"
)

// ActivityDTO - Un evento reciente de las unidades del residente
type ActivityDTO struct {
	Kind     string
	Title    string
	Subtitle string
	At       time.Time
}

// ResidentOverviewDTO - Resumen del residente para el panel de detalle
type ResidentOverviewDTO struct {
	Stats      ResidentOverviewStatsDTO
	Housemates []HousemateDTO
	Activity   []ActivityDTO
}
