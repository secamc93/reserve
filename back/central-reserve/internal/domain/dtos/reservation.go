package dtos

import (
	"central_reserve/internal/domain/entities"
	"time"
)

// ReserveDetailDTO representa el detalle completo de una reserva con información relacionada
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
	ClienteDni      *string

	// Mesa
	MesaID        *uint
	MesaNumero    *int
	MesaCapacidad *int

	// Negocio
	NegocioID        uint
	NegocioNombre    string
	NegocioCodigo    string
	NegocioDireccion string

	// Usuario
	UsuarioID     *uint
	UsuarioNombre *string
	UsuarioEmail  *string

	// Historial de Estados
	StatusHistory []entities.ReservationStatusHistory `gorm:"-"`
}

// DBReservationStatusHistory representa el modelo de base de datos para crear historial
type DBReservationStatusHistory struct {
	ReservationID   uint
	StatusID        uint
	ChangedByUserID *uint
}
