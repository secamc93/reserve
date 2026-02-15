package mappers

import (
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/response"
)

// MapAttendanceRecordDTOToResponse convierte un AttendanceRecordDTO a AttendanceRecordResponse
func MapAttendanceRecordDTOToResponse(dto domain.AttendanceRecordDTO) response.AttendanceRecordResponse {
	return response.AttendanceRecordResponse{
		ID:                dto.ID,
		AttendanceListID:  dto.AttendanceListID,
		PropertyUnitID:    dto.PropertyUnitID,
		ResidentID:        dto.ResidentID,
		ProxyID:           dto.ProxyID,
		AttendedAsOwner:   dto.AttendedAsOwner,
		AttendedAsProxy:   dto.AttendedAsProxy,
		Signature:         dto.Signature,
		SignatureDate:     dto.SignatureDate,
		SignatureMethod:   dto.SignatureMethod,
		VerifiedBy:        dto.VerifiedBy,
		VerificationDate:  dto.VerificationDate,
		VerificationNotes: dto.VerificationNotes,
		Notes:             dto.Notes,
		IsValid:           dto.IsValid,
		CreatedAt:         dto.CreatedAt,
		UpdatedAt:         dto.UpdatedAt,
		ResidentName:      dto.ResidentName,
		ProxyName:         dto.ProxyName,
		UnitNumber:        dto.UnitNumber,
	}
}

// MapAttendanceListDTOToResponse convierte un AttendanceListDTO a AttendanceListResponse
func MapAttendanceListDTOToResponse(dto domain.AttendanceListDTO) response.AttendanceListResponse {
	return response.AttendanceListResponse{
		ID:              dto.ID,
		VotingGroupID:   dto.VotingGroupID,
		Title:           dto.Title,
		Description:     dto.Description,
		IsActive:        dto.IsActive,
		CreatedByUserID: dto.CreatedByUserID,
		Notes:           dto.Notes,
		CreatedAt:       dto.CreatedAt,
		UpdatedAt:       dto.UpdatedAt,
	}
}

// MapProxyDTOToResponse convierte un ProxyDTO a ProxyResponse
func MapProxyDTOToResponse(dto domain.ProxyDTO) response.ProxyResponse {
	return response.ProxyResponse{
		ID:              dto.ID,
		BusinessID:      dto.BusinessID,
		PropertyUnitID:  dto.PropertyUnitID,
		ProxyName:       dto.ProxyName,
		ProxyDni:        dto.ProxyDni,
		ProxyEmail:      dto.ProxyEmail,
		ProxyPhone:      dto.ProxyPhone,
		ProxyAddress:    dto.ProxyAddress,
		ProxyType:       dto.ProxyType,
		IsActive:        dto.IsActive,
		StartDate:       dto.StartDate,
		EndDate:         dto.EndDate,
		PowerOfAttorney: dto.PowerOfAttorney,
		Notes:           dto.Notes,
		CreatedAt:       dto.CreatedAt,
		UpdatedAt:       dto.UpdatedAt,
	}
}

// MapProxyDTOsToResponse convierte una lista de ProxyDTO a lista de ProxyResponse
func MapProxyDTOsToResponse(dtos []domain.ProxyDTO) []response.ProxyResponse {
	result := make([]response.ProxyResponse, len(dtos))
	for i, dto := range dtos {
		result[i] = MapProxyDTOToResponse(dto)
	}
	return result
}

// MapAttendanceRecordDTOsToResponse convierte una lista de AttendanceRecordDTO a lista de AttendanceRecordResponse
func MapAttendanceRecordDTOsToResponse(dtos []domain.AttendanceRecordDTO) []response.AttendanceRecordResponse {
	result := make([]response.AttendanceRecordResponse, len(dtos))
	for i, dto := range dtos {
		result[i] = MapAttendanceRecordDTOToResponse(dto)
	}
	return result
}

// MapAttendanceListDTOsToResponse convierte una lista de AttendanceListDTO a lista de AttendanceListResponse
func MapAttendanceListDTOsToResponse(dtos []domain.AttendanceListDTO) []response.AttendanceListResponse {
	result := make([]response.AttendanceListResponse, len(dtos))
	for i, dto := range dtos {
		result[i] = MapAttendanceListDTOToResponse(dto)
	}
	return result
}
