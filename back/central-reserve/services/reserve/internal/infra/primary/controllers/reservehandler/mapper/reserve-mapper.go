package mapper

import (
	"central_reserve/services/reserve/internal/domain"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/request"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/response"
)

// ReserveToDomain convierte un request.Reservation a entities.Reservation
func ReserveToDomain(r request.Reservation) domain.Reservation {
	return domain.Reservation{
		BusinessID:     r.BusinessID,
		StartAt:        r.StartAt,
		EndAt:          r.EndAt,
		NumberOfGuests: r.NumberOfGuests,
	}
}

// MapToReserveDetail convierte un dtos.ReserveDetailDTO a response.ReserveDetail
func MapToReserveDetail(dto domain.ReserveDetailDTO) response.ReserveDetail {
	return response.ReserveDetail{
		ReservaID:          dto.ReservaID,
		StartAt:            dto.StartAt,
		EndAt:              dto.EndAt,
		NumberOfGuests:     dto.NumberOfGuests,
		ReservaCreada:      dto.ReservaCreada,
		ReservaActualizada: dto.ReservaActualizada,
		EstadoID:           dto.EstadoID,
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
func MapToReserveDetailList(dtoList []domain.ReserveDetailDTO) []response.ReserveDetail {
	if dtoList == nil {
		return nil
	}

	responseList := make([]response.ReserveDetail, len(dtoList))
	for i, dto := range dtoList {
		responseList[i] = MapToReserveDetail(dto)
	}
	return responseList
}

// MapToReservationStatus convierte un dtos.ReservationStatusDTO a response.ReservationStatus
func MapToReservationStatus(dto domain.ReservationStatusDTO) response.ReservationStatus {
	return response.ReservationStatus{
		ID:   dto.ID,
		Code: dto.Code,
		Name: dto.Name,
	}
}

// MapToReservationStatusList convierte un slice de dtos.ReservationStatusDTO a slice de response.ReservationStatus
func MapToReservationStatusList(dtoList []domain.ReservationStatusDTO) []response.ReservationStatus {
	if dtoList == nil {
		return nil
	}
	responseList := make([]response.ReservationStatus, len(dtoList))
	for i, dto := range dtoList {
		responseList[i] = MapToReservationStatus(dto)
	}
	return responseList
}
