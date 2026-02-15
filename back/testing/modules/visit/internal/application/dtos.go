package application

// CreateVisitorDTO representa los datos para crear un visitante
type CreateVisitorDTO struct {
	DNI      string
	FullName string
	Phone    string
	Email    string
}

// CreateVisitDTO representa los datos para crear una visita
type CreateVisitDTO struct {
	VisitorID          uint
	PropertyUnitID     uint
	VisitTypeID        uint
	ScheduledDate      string
	ScheduledStartTime string
	Purpose            string
	NumberOfVisitors   int
	NotifyResident     bool
	NotifySecurity     bool
}

// UpdateVisitDTO representa los datos para actualizar una visita
type UpdateVisitDTO struct {
	VisitorID          uint
	PropertyUnitID     uint
	VisitTypeID        uint
	ScheduledDate      string
	ScheduledStartTime string
	Purpose            string
	NumberOfVisitors   int
	NotifyResident     bool
	NotifySecurity     bool
}

// CreateCompanionDTO representa los datos para crear un acompañante
type CreateCompanionDTO struct {
	DNI      string
	FullName string
}

// RegisterAssetDTO representa los datos para registrar un activo
type RegisterAssetDTO struct {
	Description string // Mapeado a asset_name en la API
	Serial      string // asset_serial (opcional)
	Brand       string // asset_brand (opcional)
}

// EntryRequestDTO representa una solicitud de entrada
type EntryRequestDTO struct {
	VisitID uint
	Gate    string
	Method  string
}

// ExitRequestDTO representa una solicitud de salida
type ExitRequestDTO struct {
	VisitID uint
	Gate    string
}
