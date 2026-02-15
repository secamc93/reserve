package mappers

import (
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/request"
)

// MapCreateProxyRequestToDTO convierte un CreateProxyRequest a CreateProxyDTO
func MapCreateProxyRequestToDTO(req request.CreateProxyRequest, businessID uint) domain.CreateProxyDTO {
	return domain.CreateProxyDTO{
		BusinessID:      businessID,
		PropertyUnitID:  req.PropertyUnitID,
		ProxyName:       req.ProxyName,
		ProxyDni:        req.ProxyDni,
		ProxyEmail:      req.ProxyEmail,
		ProxyPhone:      req.ProxyPhone,
		ProxyAddress:    req.ProxyAddress,
		ProxyType:       req.ProxyType,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		PowerOfAttorney: req.PowerOfAttorney,
		Notes:           req.Notes,
	}
}

// MapUpdateProxyRequestToDTO convierte un UpdateProxyRequest a UpdateProxyDTO
func MapUpdateProxyRequestToDTO(req request.UpdateProxyRequest) domain.UpdateProxyDTO {
	return domain.UpdateProxyDTO{
		ProxyName:       req.ProxyName,
		ProxyDni:        req.ProxyDni,
		ProxyEmail:      req.ProxyEmail,
		ProxyPhone:      req.ProxyPhone,
		ProxyAddress:    req.ProxyAddress,
		ProxyType:       req.ProxyType,
		IsActive:        req.IsActive,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		PowerOfAttorney: req.PowerOfAttorney,
		Notes:           req.Notes,
	}
}

// MapCreateAttendanceListRequestToDTO convierte un CreateAttendanceListRequest a CreateAttendanceListDTO
func MapCreateAttendanceListRequestToDTO(req request.CreateAttendanceListRequest) domain.CreateAttendanceListDTO {
	return domain.CreateAttendanceListDTO{
		VotingGroupID:   req.VotingGroupID,
		Title:           req.Title,
		Description:     req.Description,
		CreatedByUserID: req.CreatedByUserID,
		Notes:           req.Notes,
	}
}
