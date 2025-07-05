package response

import (
	"time"
)

type StatusHistory struct {
	ID              uint      `json:"id"`
	StatusID        uint      `json:"status_id"`
	StatusCode      string    `json:"status_code"`
	StatusName      string    `json:"status_name"`
	ChangedAt       time.Time `json:"changed_at"`
	ChangedByUserID *uint     `json:"changed_by_user_id"`
	ChangedByUser   *string   `json:"changed_by_user"`
}

type ReserveDetail struct {
	// Reserva
	ReservaID          uint      `json:"reserva_id"`
	StartAt            time.Time `json:"start_at"`
	EndAt              time.Time `json:"end_at"`
	NumberOfGuests     int       `json:"number_of_guests"`
	ReservaCreada      time.Time `json:"reserva_creada"`
	ReservaActualizada time.Time `json:"reserva_actualizada"`

	// Estado
	EstadoCodigo string `json:"estado_codigo"`
	EstadoNombre string `json:"estado_nombre"`

	// Cliente
	ClienteID       uint   `json:"cliente_id"`
	ClienteNombre   string `json:"cliente_nombre"`
	ClienteEmail    string `json:"cliente_email"`
	ClienteTelefono string `json:"cliente_telefono"`
	ClienteDni      uint   `json:"cliente_dni"`

	// Mesa
	MesaID        *uint `json:"mesa_id"`
	MesaNumero    *int  `json:"mesa_numero"`
	MesaCapacidad *int  `json:"mesa_capacidad"`

	// Restaurante
	RestauranteID        uint   `json:"restaurante_id"`
	RestauranteNombre    string `json:"restaurante_nombre"`
	RestauranteCodigo    string `json:"restaurante_codigo"`
	RestauranteDireccion string `json:"restaurante_direccion"`

	// Usuario
	UsuarioID     *uint   `json:"usuario_id"`
	UsuarioNombre *string `json:"usuario_nombre"`
	UsuarioEmail  *string `json:"usuario_email"`

	// Historial de Estados - usando el struct del dominio con tags JSON
	StatusHistory []StatusHistoryResponse `json:"status_history"`
}

type StatusHistoryResponse struct {
	ID              uint      `json:"id"`
	StatusID        uint      `json:"status_id"`
	StatusCode      string    `json:"status_code"`
	StatusName      string    `json:"status_name"`
	ChangedAt       time.Time `json:"changed_at"`
	ChangedByUserID *uint     `json:"changed_by_user_id"`
	ChangedByUser   *string   `json:"changed_by_user"`
}
