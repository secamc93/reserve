package mappers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"dbpostgres/app/infra/models"
)

// VisitToDomain convierte modelo de BD a entidad de dominio
func VisitToDomain(m *models.Visit) *domain.Visit {
	return &domain.Visit{
		ID:                      m.ID,
		BusinessID:              m.BusinessID,
		VisitorID:               m.VisitorID,
		PropertyUnitID:          m.PropertyUnitID,
		ResidentID:              m.ResidentID,
		VisitTypeID:             m.VisitTypeID,
		VisitStatusID:           m.VisitStatusID,
		VisitorVehicleID:        m.VisitorVehicleID,
		ScheduledDate:           m.ScheduledDate,
		ScheduledStartTime:      m.ScheduledStartTime,
		ScheduledEndTime:        m.ScheduledEndTime,
		ActualEntryTime:         m.ActualEntryTime,
		ActualExitTime:          m.ActualExitTime,
		DurationMinutes:         m.DurationMinutes,
		AuthorizationCode:       m.AuthorizationCode,
		QRCode:                  m.QRCode,
		QRCodeExpiresAt:         m.QRCodeExpiresAt,
		AuthorizedByResidentID:  m.AuthorizedByResidentID,
		AuthorizationDate:       m.AuthorizationDate,
		AuthorizationExpiresAt:  m.AuthorizationExpiresAt,
		RegisteredByUserID:      m.RegisteredByUserID,
		EntryRegisteredByUserID: m.EntryRegisteredByUserID,
		ExitRegisteredByUserID:  m.ExitRegisteredByUserID,
		EntryGate:               m.EntryGate,
		ExitGate:                m.ExitGate,
		EntryMethod:             m.EntryMethod,
		Purpose:                 m.Purpose,
		NumberOfVisitors:        m.NumberOfVisitors,
		HasCompanions:           m.HasCompanions,
		HasAssets:               m.HasAssets,
		Notes:                   m.Notes,
		IsRecurring:             m.IsRecurring,
		RecurringPatternID:      m.RecurringPatternID,
		ParentVisitID:           m.ParentVisitID,
		DurationExceeded:        m.DurationExceeded,
		DurationExceededAt:      m.DurationExceededAt,
		AlertSent:               m.AlertSent,
		NotifyResident:          m.NotifyResident,
		NotifySecurity:          m.NotifySecurity,
		NotificationSentAt:      m.NotificationSentAt,
		CreatedAt:               m.CreatedAt,
		UpdatedAt:               m.UpdatedAt,
	}
}

// VisitorToDomain convierte modelo de visitante a dominio
func VisitorToDomain(m *models.Visitor) *domain.Visitor {
	return &domain.Visitor{
		ID:           m.ID,
		BusinessID:   m.BusinessID,
		DNI:          m.DNI,
		FullName:     m.FullName,
		Phone:        m.Phone,
		Email:        m.Email,
		PhotoURL:     m.PhotoURL,
		HasBlacklist: m.HasBlacklist,
		IsVerified:   m.IsVerified,
		LastVisitAt:  m.LastVisitAt,
		TotalVisits:  m.TotalVisits,
		Notes:        m.Notes,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}

// CompanionToDomain convierte modelo de acompañante a dominio
func CompanionToDomain(m *models.VisitCompanion) *domain.VisitCompanion {
	return &domain.VisitCompanion{
		ID:             m.ID,
		VisitID:        m.VisitID,
		VisitorID:      m.VisitorID,
		CompanionName:  m.CompanionName,
		CompanionDNI:   m.CompanionDNI,
		CompanionPhone: m.CompanionPhone,
		IsMinor:        m.IsMinor,
		Relationship:   m.Relationship,
		Notes:          m.Notes,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}

// CompanionsToDomain convierte slice de modelos a slice de dominio
func CompanionsToDomain(models []*models.VisitCompanion) []*domain.VisitCompanion {
	result := make([]*domain.VisitCompanion, len(models))
	for i, m := range models {
		result[i] = CompanionToDomain(m)
	}
	return result
}

// AssetToDomain convierte modelo de activo a dominio
func AssetToDomain(m *models.VisitAsset) *domain.VisitAsset {
	return &domain.VisitAsset{
		ID:                    m.ID,
		VisitID:               m.VisitID,
		AssetName:             m.AssetName,
		AssetDescription:      m.AssetDescription,
		AssetSerial:           m.AssetSerial,
		AssetBrand:            m.AssetBrand,
		EntryRegistered:       m.EntryRegistered,
		EntryRegisteredAt:     m.EntryRegisteredAt,
		ExitRegistered:        m.ExitRegistered,
		ExitRegisteredAt:      m.ExitRegisteredAt,
		EntryVerifiedByUserID: m.EntryVerifiedByUserID,
		ExitVerifiedByUserID:  m.ExitVerifiedByUserID,
		Notes:                 m.Notes,
		CreatedAt:             m.CreatedAt,
		UpdatedAt:             m.UpdatedAt,
	}
}

// AssetsToDomain convierte slice de modelos a slice de dominio
func AssetsToDomain(models []*models.VisitAsset) []*domain.VisitAsset {
	result := make([]*domain.VisitAsset, len(models))
	for i, m := range models {
		result[i] = AssetToDomain(m)
	}
	return result
}

// BlacklistToDomain convierte modelo de blacklist a dominio
func BlacklistToDomain(m *models.VisitBlacklist) *domain.VisitBlacklist {
	return &domain.VisitBlacklist{
		ID:                m.ID,
		BusinessID:        m.BusinessID,
		VisitorID:         m.VisitorID,
		Reason:            m.Reason,
		BlockedByUserID:   m.BlockedByUserID,
		BlockedAt:         m.BlockedAt,
		UnblockedAt:       m.UnblockedAt,
		UnblockedByUserID: m.UnblockedByUserID,
		UnblockReason:     m.UnblockReason,
		IsActive:          m.IsActive,
		Notes:             m.Notes,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
}

// BlacklistsToDomain convierte slice de modelos a slice de dominio
func BlacklistsToDomain(models []*models.VisitBlacklist) []*domain.VisitBlacklist {
	result := make([]*domain.VisitBlacklist, len(models))
	for i, m := range models {
		result[i] = BlacklistToDomain(m)
	}
	return result
}
