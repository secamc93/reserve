package domain

import (
	"time"
)

type Reservation struct {
	Id              uint
	RestaurantID    uint
	TableID         *uint
	ClientID        uint
	CreatedByUserID *uint
	StartAt         time.Time
	EndAt           time.Time
	NumberOfGuests  int
	StatusID        uint
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

type Client struct {
	ID           uint
	RestaurantID uint
	Name         string
	Email        string
	Phone        string
	Dni          uint
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
}

type Table struct {
	ID           uint
	RestaurantID uint
	Number       int
	Capacity     int
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
}

type RestaurantStaff struct {
	ID           uint
	UserID       uint
	RestaurantID uint
	Role         string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
}

type ReservationStatus struct {
	ID        uint
	Code      string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

type ReservationStatusHistory struct {
	ID              uint
	ReservationID   uint
	StatusID        uint
	ChangedByUserID *uint
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

type ReserveDetailDTO struct {
	// Reserva
	ReservaID          uint
	StartAt            time.Time
	EndAt              time.Time
	NumberOfGuests     int
	ReservaCreada      time.Time
	ReservaActualizada time.Time

	// Estado
	EstadoCodigo string
	EstadoNombre string

	// Cliente
	ClienteID       uint
	ClienteNombre   string
	ClienteEmail    string
	ClienteTelefono string
	ClienteDni      uint

	// Mesa
	MesaID        *uint
	MesaNumero    *int
	MesaCapacidad *int

	// Restaurante
	RestauranteID        uint
	RestauranteNombre    string
	RestauranteCodigo    string
	RestauranteDireccion string

	// Usuario
	UsuarioID     *uint
	UsuarioNombre *string
	UsuarioEmail  *string
}
