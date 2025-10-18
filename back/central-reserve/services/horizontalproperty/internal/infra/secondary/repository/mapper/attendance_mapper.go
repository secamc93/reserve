package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"dbpostgres/app/infra/models"
	"time"
)

// MapAttendanceListToDomain - Mapear modelo de base de datos a entidad de dominio
func MapAttendanceListToDomain(m *models.AttendanceList) *domain.AttendanceList {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	return &domain.AttendanceList{
		ID:              m.ID,
		VotingGroupID:   m.VotingGroupID,
		Title:           m.Title,
		Description:     m.Description,
		IsActive:        m.IsActive,
		CreatedByUserID: m.CreatedByUserID,
		Notes:           m.Notes,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
		DeletedAt:       deletedAt,
	}
}

// MapProxyToDomain - Mapear modelo de base de datos a entidad de dominio
func MapProxyToDomain(m *models.Proxy) *domain.Proxy {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	return &domain.Proxy{
		ID:              m.ID,
		BusinessID:      m.BusinessID,
		PropertyUnitID:  m.PropertyUnitID,
		ProxyName:       m.ProxyName,
		ProxyDni:        m.ProxyDni,
		ProxyEmail:      m.ProxyEmail,
		ProxyPhone:      m.ProxyPhone,
		ProxyAddress:    m.ProxyAddress,
		ProxyType:       m.ProxyType,
		IsActive:        m.IsActive,
		StartDate:       m.StartDate,
		EndDate:         m.EndDate,
		PowerOfAttorney: m.PowerOfAttorney,
		Notes:           m.Notes,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
		DeletedAt:       deletedAt,
	}
}

// MapAttendanceRecordToDomain - Mapear modelo de base de datos a entidad de dominio
func MapAttendanceRecordToDomain(m *models.AttendanceRecord) *domain.AttendanceRecord {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	return &domain.AttendanceRecord{
		ID:                       m.ID,
		AttendanceListID:         m.AttendanceListID,
		PropertyUnitID:           m.PropertyUnitID,
		ResidentID:               m.ResidentID,
		ProxyID:                  m.ProxyID,
		AttendedAsOwner:          m.AttendedAsOwner,
		AttendedAsProxy:          m.AttendedAsProxy,
		Signature:                m.Signature,
		SignatureDate:            m.SignatureDate,
		SignatureMethod:          m.SignatureMethod,
		VerifiedBy:               m.VerifiedBy,
		VerificationDate:         m.VerificationDate,
		VerificationNotes:        m.VerificationNotes,
		Notes:                    m.Notes,
		IsValid:                  m.IsValid,
		CreatedAt:                m.CreatedAt,
		UpdatedAt:                m.UpdatedAt,
		DeletedAt:                deletedAt,
		ParticipationCoefficient: "", // Se asignará después en el repositorio
	}
}
