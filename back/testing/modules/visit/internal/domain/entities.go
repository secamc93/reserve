package domain

import "time"

// Visitor representa un visitante en el dominio
type Visitor struct {
	ID       uint
	DNI      string
	FullName string
	Phone    string
	Email    string
}

// Visit representa una visita programada o activa
type Visit struct {
	ID                 uint
	VisitorID          uint
	PropertyUnitID     uint
	VisitStatusID      uint
	VisitTypeID        uint
	Purpose            string
	ScheduledDate      string
	ScheduledStartTime string
	NumberOfVisitors   int
	NotifyResident     bool
	NotifySecurity     bool
	QRCode             string
	ActualEntryTime    *time.Time
	ActualExitTime     *time.Time
}

// Companion representa un acompañante de una visita
type Companion struct {
	ID           uint
	VisitID      uint
	DNI          string
	FullName     string
	Phone        string
	Relationship string
	IsMinor      bool
}

// Asset representa un activo registrado en una visita
type Asset struct {
	ID          uint
	VisitID     uint
	Description string // Mapeado a asset_name en la API
	Serial      string // asset_serial
	Brand       string // asset_brand
}

// VisitType representa un tipo de visita (Visitante, Proveedor, etc.)
type VisitType struct {
	ID   uint
	Name string
}

// VisitStatus representa el estado de una visita (Pendiente, Activa, Completada)
type VisitStatus struct {
	ID   uint
	Name string
}

// Business representa un negocio/propiedad horizontal
type Business struct {
	ID             uint
	Name           string
	BusinessTypeID uint
}

// PropertyUnit representa una unidad/apartamento de una propiedad horizontal
type PropertyUnit struct {
	ID         uint
	Identifier string // Ej: "Apto 101", "Casa 5"
	Block      string // Bloque o torre
	UnitType   string // Tipo de unidad
	BusinessID uint
}

// EntryRequest representa una solicitud de registro de entrada
type EntryRequest struct {
	Gate   string
	Method string
}

// ExitRequest representa una solicitud de registro de salida
type ExitRequest struct {
	Gate string
}
