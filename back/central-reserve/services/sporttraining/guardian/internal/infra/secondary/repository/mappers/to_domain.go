package mappers

import (
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"dbpostgres/app/infra/models"
)

// GuardianToDomain mapea modelo GORM a entidad de dominio
func GuardianToDomain(m *models.STGuardian) *domain.Guardian {
	return &domain.Guardian{
		ID:               m.ID,
		BusinessID:       m.BusinessID,
		UserID:           m.UserID,
		FirstName:        m.FirstName,
		LastName:         m.LastName,
		DocumentType:     m.DocumentType,
		DocumentNumber:   m.DocumentNumber,
		Email:            m.Email,
		Phone:            m.Phone,
		SecondaryPhone:   m.SecondaryPhone,
		Address:          m.Address,
		City:             m.City,
		State:            m.State,
		Country:          m.Country,
		Relationship:     m.Relationship,
		PhotoURL:         m.PhotoURL,
		Notes:            m.Notes,
		CanBookSessions:  m.CanBookSessions,
		CanAccessRecords: m.CanAccessRecords,
		IsActive:         m.IsActive,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}
