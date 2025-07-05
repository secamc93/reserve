package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/response"
)

func ReserveToDomain(r request.Reservation) domain.Reservation {
	return domain.Reservation{
		RestaurantID:   r.RestaurantID,
		ClientID:       r.Dni,
		StartAt:        r.StartAt,
		EndAt:          r.EndAt,
		NumberOfGuests: r.NumberOfGuests,
		StatusID:       1,
	}
}

func MapToReserveDetail(dto domain.ReserveDetailDTO) response.ReserveDetail {
	return response.ReserveDetail{
		ReservaID:            dto.ReservaID,
		StartAt:              dto.StartAt,
		EndAt:                dto.EndAt,
		NumberOfGuests:       dto.NumberOfGuests,
		ReservaCreada:        dto.ReservaCreada,
		ReservaActualizada:   dto.ReservaActualizada,
		EstadoCodigo:         dto.EstadoCodigo,
		EstadoNombre:         dto.EstadoNombre,
		ClienteID:            dto.ClienteID,
		ClienteNombre:        dto.ClienteNombre,
		ClienteEmail:         dto.ClienteEmail,
		ClienteTelefono:      dto.ClienteTelefono,
		ClienteDni:           dto.ClienteDni,
		MesaID:               dto.MesaID,
		MesaNumero:           dto.MesaNumero,
		MesaCapacidad:        dto.MesaCapacidad,
		RestauranteID:        dto.RestauranteID,
		RestauranteNombre:    dto.RestauranteNombre,
		RestauranteCodigo:    dto.RestauranteCodigo,
		RestauranteDireccion: dto.RestauranteDireccion,
		UsuarioID:            dto.UsuarioID,
		UsuarioNombre:        dto.UsuarioNombre,
		UsuarioEmail:         dto.UsuarioEmail,
	}
}

func MapToReserveDetailList(dtoList []domain.ReserveDetailDTO) []response.ReserveDetail {
	var reserves []response.ReserveDetail
	for _, dto := range dtoList {
		reserves = append(reserves, MapToReserveDetail(dto))
	}
	return reserves
}
