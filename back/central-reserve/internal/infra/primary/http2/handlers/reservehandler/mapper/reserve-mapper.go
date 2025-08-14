package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/response"
)

// ReserveToDomain convierte un request.Reservation a entities.Reservation
func ReserveToDomain(r request.Reservation) entities.Reservation {
	return entities.Reservation{
		BusinessID:     r.BusinessID,
		StartAt:        r.StartAt,
		EndAt:          r.EndAt,
		NumberOfGuests: r.NumberOfGuests,
	}
}

// MapToReserveDetail convierte un dtos.ReserveDetailDTO a response.ReserveDetail
func MapToReserveDetail(dto dtos.ReserveDetailDTO) response.ReserveDetail {
	return response.ReserveDetail{
		ReservaID:          dto.ReservaID,
		StartAt:            dto.StartAt,
		EndAt:              dto.EndAt,
		NumberOfGuests:     dto.NumberOfGuests,
		ReservaCreada:      dto.ReservaCreada,
		ReservaActualizada: dto.ReservaActualizada,
		EstadoCodigo:       dto.EstadoCodigo,
		EstadoNombre:       dto.EstadoNombre,
		ClienteID:          dto.ClienteID,
		ClienteNombre:      dto.ClienteNombre,
		ClienteEmail:       dto.ClienteEmail,
		ClienteTelefono:    dto.ClienteTelefono,
		ClienteDni: func() string {
			if dto.ClienteDni != nil {
				return *dto.ClienteDni
			}
			return ""
		}(),
		MesaID:           dto.MesaID,
		MesaNumero:       dto.MesaNumero,
		MesaCapacidad:    dto.MesaCapacidad,
		NegocioID:        dto.NegocioID,
		NegocioNombre:    dto.NegocioNombre,
		NegocioCodigo:    dto.NegocioCodigo,
		NegocioDireccion: dto.NegocioDireccion,
		UsuarioID:        dto.UsuarioID,
		UsuarioNombre:    dto.UsuarioNombre,
		UsuarioEmail:     dto.UsuarioEmail,
	}
}

// MapToReserveDetailList convierte un slice de dtos.ReserveDetailDTO a slice de response.ReserveDetail
func MapToReserveDetailList(dtoList []dtos.ReserveDetailDTO) []response.ReserveDetail {
	if dtoList == nil {
		return nil
	}

	responseList := make([]response.ReserveDetail, len(dtoList))
	for i, dto := range dtoList {
		responseList[i] = MapToReserveDetail(dto)
	}
	return responseList
}
