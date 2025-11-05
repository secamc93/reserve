package domain

import "time"

type ReserveDetailDTO struct {
	// Reserva
	ReservaID          uint
	StartAt            time.Time
	EndAt              time.Time
	NumberOfGuests     int
	ReservaCreada      time.Time
	ReservaActualizada time.Time

	// Estado
	EstadoID     uint
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
}

// DBReservationStatusHistory representa el modelo de base de datos para crear historial
type DBReservationStatusHistory struct {
	ReservationID   uint
	StatusID        uint
	ChangedByUserID *uint
}

// UpdateReservationDTO encapsula los campos opcionales para actualizar una reserva
type UpdateReservationDTO struct {
	ID             uint
	TableID        *uint
	StartAt        *time.Time
	EndAt          *time.Time
	NumberOfGuests *int
	StatusID       *uint
}

type ReservationStatusDTO struct {
	ID   uint
	Code string
	Name string
}
