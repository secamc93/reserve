package mappers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
)

// VisitToResponse convierte entidad de visita a response
func VisitToResponse(visit *domain.Visit) response.VisitData {
	return response.VisitData{
		ID:                 visit.ID,
		BusinessID:         visit.BusinessID,
		VisitorID:          visit.VisitorID,
		PropertyUnitID:     visit.PropertyUnitID,
		ResidentID:         visit.ResidentID,
		VisitTypeID:        visit.VisitTypeID,
		VisitStatusID:      visit.VisitStatusID,
		ScheduledDate:      visit.ScheduledDate,
		ScheduledStartTime: visit.ScheduledStartTime,
		ScheduledEndTime:   visit.ScheduledEndTime,
		ActualEntryTime:    visit.ActualEntryTime,
		ActualExitTime:     visit.ActualExitTime,
		AuthorizationCode:  visit.AuthorizationCode,
		QRCode:             visit.QRCode,
		Purpose:            visit.Purpose,
		Notes:              visit.Notes,
	}
}

// VisitListDTOsToResponse convierte lista de DTOs a response
func VisitListDTOsToResponse(visits []domain.VisitListDTO) []response.VisitListData {
	result := make([]response.VisitListData, len(visits))
	for i, v := range visits {
		result[i] = response.VisitListData{
			ID:                 v.ID,
			VisitorName:        v.VisitorName,
			VisitorDNI:         v.VisitorDNI,
			PropertyUnitNumber: v.PropertyUnitNumber,
			VisitTypeName:      v.VisitTypeName,
			VisitStatusName:    v.VisitStatusName,
			ScheduledDate:      v.ScheduledDate,
			ActualEntryTime:    v.ActualEntryTime,
			ActualExitTime:     v.ActualExitTime,
			CreatedAt:          v.CreatedAt,
		}
	}
	return result
}

// CompanionToResponse convierte acompañante a response
func CompanionToResponse(comp *domain.VisitCompanion) response.CompanionData {
	return response.CompanionData{
		ID:             comp.ID,
		VisitID:        comp.VisitID,
		CompanionName:  comp.CompanionName,
		CompanionDNI:   comp.CompanionDNI,
		CompanionPhone: comp.CompanionPhone,
		IsMinor:        comp.IsMinor,
		Relationship:   comp.Relationship,
		Notes:          comp.Notes,
	}
}

// CompanionsToResponse convierte lista de acompañantes a response
func CompanionsToResponse(companions []*domain.VisitCompanion) []response.CompanionData {
	result := make([]response.CompanionData, len(companions))
	for i, comp := range companions {
		result[i] = CompanionToResponse(comp)
	}
	return result
}

// VisitTypesToResponse convierte tipos de visita a response
func VisitTypesToResponse(types []*domain.VisitType) []response.VisitTypeData {
	result := make([]response.VisitTypeData, len(types))
	for i, t := range types {
		result[i] = response.VisitTypeData{
			ID:                          t.ID,
			Name:                        t.Name,
			Code:                        t.Code,
			Description:                 t.Description,
			RequiresAuthorization:       t.RequiresAuthorization,
			RequiresVehicleRegistration: t.RequiresVehicleRegistration,
			RequiresCompanions:          t.RequiresCompanions,
			RequiresAssetsTracking:      t.RequiresAssetsTracking,
			MaxDurationHours:            t.MaxDurationHours,
			DefaultDurationMinutes:      t.DefaultDurationMinutes,
			IsActive:                    t.IsActive,
		}
	}
	return result
}

// VisitStatusesToResponse convierte estados de visita a response
func VisitStatusesToResponse(statuses []*domain.VisitStatus) []response.VisitStatusData {
	result := make([]response.VisitStatusData, len(statuses))
	for i, s := range statuses {
		result[i] = response.VisitStatusData{
			ID:          s.ID,
			Code:        s.Code,
			Name:        s.Name,
			Description: s.Description,
			IsFinal:     s.IsFinal,
			IsActive:    s.IsActive,
		}
	}
	return result
}

// VisitorToResponse convierte visitante a response
func VisitorToResponse(visitor *domain.Visitor) response.VisitorData {
	return response.VisitorData{
		ID:           visitor.ID,
		BusinessID:   visitor.BusinessID,
		DNI:          visitor.DNI,
		FullName:     visitor.FullName,
		Phone:        visitor.Phone,
		Email:        visitor.Email,
		PhotoURL:     visitor.PhotoURL,
		HasBlacklist: visitor.HasBlacklist,
		IsVerified:   visitor.IsVerified,
		TotalVisits:  visitor.TotalVisits,
	}
}
