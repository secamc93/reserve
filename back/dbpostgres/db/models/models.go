package models

import (
	"time"

	"gorm.io/gorm"
)

// ───────────────────────────────────────────
//
//	RESTAURANTS  (multi-tenant)
//
// ───────────────────────────────────────────
type Restaurant struct {
	gorm.Model
	Name     string `gorm:"size:120;not null"`
	Code     string `gorm:"size:50;not null;unique"` // slug
	Timezone string `gorm:"size:40;default:'America/Bogota'"`
	Address  string `gorm:"size:255"`

	Tables       []Table
	Reservations []Reservation
	Staff        []RestaurantStaff
	Clients      []Client
}

// ───────────────────────────────────────────
//
//	USERS – cuentas internas (staff global)
//
// ───────────────────────────────────────────
type User struct {
	gorm.Model
	Name     string `gorm:"size:255;not null"`
	Email    string `gorm:"size:255;not null;unique"`
	Password string `gorm:"size:255;not null"`
	Phone    string `gorm:"size:20"`
	Role     string `gorm:"varchar(20);not null"`
	// ¹ Si llegas a manejar login de clientes, usa otra tabla o auth separado.

	StaffOf []RestaurantStaff
}

// ───────────────────────────────────────────
//
//	RESTAURANT STAFF  (N:M usuario ↔ restaurante)
//
// ───────────────────────────────────────────
type RestaurantStaff struct {
	gorm.Model
	UserID       uint   `gorm:"not null;index;uniqueIndex:idx_user_restaurant,priority:1"`
	RestaurantID uint   `gorm:"not null;index;uniqueIndex:idx_user_restaurant,priority:2"`
	Role         string `gorm:"type:varchar(20);not null"`

	User       User       `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Restaurant Restaurant `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ───────────────────────────────────────────
//
//	CLIENTS – personas que hacen la reserva
//
// ───────────────────────────────────────────
type Client struct {
	gorm.Model
	RestaurantID uint   `gorm:"not null;index;uniqueIndex:idx_rest_client_email,priority:1"`
	Name         string `gorm:"size:255;not null"`
	Email        string `gorm:"size:255;uniqueIndex:idx_rest_client_email,priority:2"`
	Phone        string `gorm:"size:20"`
	Dni          int64  `gorm:"not null;uniqueIndex:idx_rest_client_dni,priority:2"`

	Reservations []Reservation
	Restaurant   Restaurant `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ───────────────────────────────────────────
//
//	TABLES – mesas físicas
//
// ───────────────────────────────────────────
type Table struct {
	gorm.Model
	RestaurantID uint `gorm:"not null;index;uniqueIndex:idx_rest_table_number,priority:1"`
	Number       int  `gorm:"not null;uniqueIndex:idx_rest_table_number,priority:2"`
	Capacity     int  `gorm:"not null"`

	Reservations []Reservation
}

// ───────────────────────────────────────────
//
//	RESERVATIONS
//
// ───────────────────────────────────────────
type Reservation struct {
	gorm.Model
	RestaurantID uint  `gorm:"not null;index"`
	TableID      *uint `gorm:"index"`
	ClientID     uint  `gorm:"not null;index"`
	// Opcional: quién registró la reserva (empleado o sistema)
	CreatedByUserID *uint `gorm:"index"`

	StartAt        time.Time `gorm:"not null;index"`
	EndAt          time.Time `gorm:"not null"`
	NumberOfGuests int       `gorm:"not null"`
	StatusID       uint      `gorm:"not null;index"`

	Restaurant Restaurant        `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Table      Table             `gorm:"foreignKey:TableID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Client     Client            `gorm:"foreignKey:ClientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy  User              `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Status     ReservationStatus `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ───────────────────────────────────────────
//
//	RESERVATION STATUS
//
// ───────────────────────────────────────────
type ReservationStatus struct {
	gorm.Model
	Code string `gorm:"size:20;unique;not null"` // Ej: "asignado"
	Name string `gorm:"size:50;not null"`        // Ej: "Asignado"
}

// ───────────────────────────────────────────
//
//	RESERVATION STATUS HISTORY
//
// ───────────────────────────────────────────
type ReservationStatusHistory struct {
	gorm.Model
	ReservationID   uint  `gorm:"not null;index"`
	TableID         *uint `gorm:"index"` // Ahora opcional (nullable)
	StatusID        uint  `gorm:"not null;index"`
	ChangedByUserID *uint `gorm:"index"` // Quién hizo el cambio (puede ser null si fue automático)

	Reservation Reservation       `gorm:"foreignKey:ReservationID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Status      ReservationStatus `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ChangedBy   User              `gorm:"foreignKey:ChangedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}
