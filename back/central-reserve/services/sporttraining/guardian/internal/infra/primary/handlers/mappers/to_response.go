package mappers

import (
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
)

// GuardianToResponse mapea entidad de dominio a respuesta HTTP
func GuardianToResponse(g *domain.Guardian) response.GuardianData {
	return response.GuardianData{
		ID:               g.ID,
		BusinessID:       g.BusinessID,
		FirstName:        g.FirstName,
		LastName:         g.LastName,
		DocumentType:     g.DocumentType,
		DocumentNumber:   g.DocumentNumber,
		Email:            g.Email,
		Phone:            g.Phone,
		SecondaryPhone:   g.SecondaryPhone,
		Address:          g.Address,
		City:             g.City,
		State:            g.State,
		Country:          g.Country,
		Relationship:     g.Relationship,
		PhotoURL:         g.PhotoURL,
		Notes:            g.Notes,
		CanBookSessions:  g.CanBookSessions,
		CanAccessRecords: g.CanAccessRecords,
		IsActive:         g.IsActive,
		CreatedAt:        g.CreatedAt,
		UpdatedAt:        g.UpdatedAt,
	}
}
