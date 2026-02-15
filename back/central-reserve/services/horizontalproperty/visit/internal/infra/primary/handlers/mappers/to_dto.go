package mappers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
)

// CreateVisitRequestToDTO convierte request a DTO de dominio
func CreateVisitRequestToDTO(req request.CreateVisitRequest, businessID uint) domain.CreateVisitDTO {
	return domain.CreateVisitDTO{
		BusinessID:         businessID,
		VisitorID:          req.VisitorID,
		PropertyUnitID:     req.PropertyUnitID,
		ResidentID:         req.ResidentID,
		VisitTypeID:        req.VisitTypeID,
		VisitorVehicleID:   req.VisitorVehicleID,
		ScheduledDate:      req.ScheduledDate,
		ScheduledStartTime: req.ScheduledStartTime,
		ScheduledEndTime:   req.ScheduledEndTime,
		Purpose:            req.Purpose,
		NumberOfVisitors:   req.NumberOfVisitors,
		HasCompanions:      req.HasCompanions,
		HasAssets:          req.HasAssets,
		Notes:              req.Notes,
		NotifyResident:     req.NotifyResident,
		NotifySecurity:     req.NotifySecurity,
	}
}

// UpdateVisitRequestToDTO convierte request de actualización a DTO
func UpdateVisitRequestToDTO(req request.UpdateVisitRequest) domain.UpdateVisitDTO {
	return domain.UpdateVisitDTO{
		PropertyUnitID:     req.PropertyUnitID,
		ResidentID:         req.ResidentID,
		VisitTypeID:        req.VisitTypeID,
		ScheduledDate:      req.ScheduledDate,
		ScheduledStartTime: req.ScheduledStartTime,
		ScheduledEndTime:   req.ScheduledEndTime,
		Purpose:            req.Purpose,
		NumberOfVisitors:   req.NumberOfVisitors,
		Notes:              req.Notes,
		NotifyResident:     req.NotifyResident,
		NotifySecurity:     req.NotifySecurity,
	}
}

// CreateCompanionRequestToDTO convierte request de acompañante a DTO
func CreateCompanionRequestToDTO(req request.CreateCompanionRequest) domain.CreateVisitCompanionDTO {
	return domain.CreateVisitCompanionDTO{
		CompanionName:  req.CompanionName,
		CompanionDNI:   req.CompanionDNI,
		CompanionPhone: req.CompanionPhone,
		IsMinor:        req.IsMinor,
		Relationship:   req.Relationship,
		Notes:          req.Notes,
	}
}

// CreateAssetRequestsToDTO convierte slice de requests de activos a DTOs
func CreateAssetRequestsToDTO(assets []request.CreateAssetRequest) []domain.CreateVisitAssetDTO {
	result := make([]domain.CreateVisitAssetDTO, len(assets))
	for i, a := range assets {
		result[i] = domain.CreateVisitAssetDTO{
			AssetName:        a.AssetName,
			AssetDescription: a.AssetDescription,
			AssetSerial:      a.AssetSerial,
			AssetBrand:       a.AssetBrand,
		}
	}
	return result
}
