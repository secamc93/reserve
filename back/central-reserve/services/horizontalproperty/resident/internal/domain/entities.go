package domain

import (
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
)

// Resident - Residente de una propiedad horizontal
type Resident struct {
	ID               uint
	BusinessID       uint
	PropertyUnitID   uint
	ResidentTypeID   uint
	Name             string
	Email            string
	Phone            string
	Dni              string
	EmergencyContact string
	IsMainResident   bool
	IsActive         bool
	MoveInDate       *time.Time
	MoveOutDate      *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// ResidentType - Tipo de residente
type ResidentType struct {
	ID          uint
	Name        string
	Code        string
	Description string
	IsActive    bool
}

// ResidentUnit - Tabla pivote para relación muchos-a-muchos entre Resident y PropertyUnit
type ResidentUnit struct {
	ID             uint
	BusinessID     uint
	ResidentID     uint
	PropertyUnitID uint
	IsMainResident bool
	MoveInDate     *time.Time
	MoveOutDate    *time.Time
	LeaseStartDate *time.Time
	LeaseEndDate   *time.Time
	MonthlyRent    *float64

	// Relaciones
	Resident     *Resident
	PropertyUnit *domain.PropertyUnit
	Business     *domain.HorizontalProperty

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}
