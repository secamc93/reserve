package domain

import "errors"

var (
	ErrParkingZoneNotFound         = errors.New("zona de parqueo no encontrada")
	ErrParkingSlotNotFound         = errors.New("espacio de parqueo no encontrado")
	ErrParkingAssignmentNotFound   = errors.New("asignación de parqueadero no encontrada")
	ErrParkingReservationNotFound  = errors.New("reserva de parqueadero no encontrada")
	ErrParkingSlotNotAvailable     = errors.New("espacio de parqueo no disponible")
	ErrParkingSlotAlreadyAssigned  = errors.New("espacio de parqueo ya está asignado")
	ErrParkingReservationOverlap   = errors.New("ya existe una reserva en ese horario")
	ErrInvalidTimeRange            = errors.New("rango de tiempo inválido")
	ErrInvalidStatusTransition     = errors.New("transición de estado inválida")
	ErrParkingReservationExpired   = errors.New("reserva expirada")
	ErrParkingReservationCancelled = errors.New("reserva cancelada")
	ErrParkingSlotOccupied         = errors.New("espacio de parqueo está ocupado")
	ErrParkingSlotNotOccupied      = errors.New("espacio de parqueo no está ocupado")
	ErrInvalidVehiclePlate         = errors.New("placa de vehículo inválida")
	ErrParkingSlotInactive         = errors.New("espacio de parqueo está inactivo")
	ErrParkingZoneInactive         = errors.New("zona de parqueo está inactiva")
)
