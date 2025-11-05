package response

import (
	"time"
)

type ReserveDetail struct {
	// Reserva
	ReservaID          uint      `json:"reserva_id"`
	StartAt            time.Time `json:"start_at"`
	EndAt              time.Time `json:"end_at"`
	NumberOfGuests     int       `json:"number_of_guests"`
	ReservaCreada      time.Time `json:"reserva_creada"`
	ReservaActualizada time.Time `json:"reserva_actualizada"`

	// Estado
	EstadoID     uint   `json:"estado_id"`
	EstadoCodigo string `json:"estado_codigo"`
	EstadoNombre string `json:"estado_nombre"`

	// Cliente
	ClienteID       uint   `json:"cliente_id"`
	ClienteNombre   string `json:"cliente_nombre"`
	ClienteEmail    string `json:"cliente_email"`
	ClienteTelefono string `json:"cliente_telefono"`
	ClienteDni      string `json:"cliente_dni"`

	// Mesa
	MesaID        *uint `json:"mesa_id"`
	MesaNumero    *int  `json:"mesa_numero"`
	MesaCapacidad *int  `json:"mesa_capacidad"`

	// Negocio (cambiado de Restaurante)
	NegocioID        uint   `json:"negocio_id"`
	NegocioNombre    string `json:"negocio_nombre"`
	NegocioCodigo    string `json:"negocio_codigo"`
	NegocioDireccion string `json:"negocio_direccion"`

	// Usuario
	UsuarioID     *uint   `json:"usuario_id"`
	UsuarioNombre *string `json:"usuario_nombre"`
	UsuarioEmail  *string `json:"usuario_email"`
}

// ReserveSuccessResponse representa una respuesta exitosa con una reserva
type ReserveSuccessResponse struct {
	Success bool          `json:"success"`
	Data    ReserveDetail `json:"data"`
}

// ReserveListSuccessResponse representa una respuesta exitosa con una lista de reservas
type ReserveListSuccessResponse struct {
	Success bool            `json:"success"`
	Data    []ReserveDetail `json:"data"`
	Total   int             `json:"total"`
}
