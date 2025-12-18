package domain

import "time"

// PackageStatus - Estado de paquete
type PackageStatus struct {
	ID          uint
	Code        string
	Name        string
	Description string
	IsFinal     bool
	IsActive    bool
}

// Package - Entidad de paquete
type Package struct {
	ID                 uint
	BusinessID         uint
	PropertyUnitID     uint
	ResidentID         *uint
	PackageStatusID    uint
	Carrier            string
	TrackingNumber     string
	QRCode             string
	ReceivedByUserID   *uint
	ReceivedAt         *time.Time
	DeliveredByUserID  *uint
	DeliveredAt        *time.Time
	Description        string
	Notes              string
	NotifyResident     bool
	NotificationSentAt *time.Time
	CreatedAt          time.Time
	UpdatedAt          time.Time

	// Relaciones (se cargan cuando se solicita)
	PropertyUnit    PropertyUnit
	Resident        *Resident
	PackageStatus   PackageStatus
	ReceivedByUser  *User
	DeliveredByUser *User
}

// PropertyUnit - Unidad de propiedad (referencia)
type PropertyUnit struct {
	ID     uint
	Number string
	Floor  *int
	Block  string
}

// Resident - Residente (referencia)
type Resident struct {
	ID       uint
	FullName string
	Email    string
	Phone    string
}

// User - Usuario (referencia)
type User struct {
	ID    uint
	Name  string
	Email string
}
