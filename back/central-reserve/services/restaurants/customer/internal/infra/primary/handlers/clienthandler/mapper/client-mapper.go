package mapper

import (
	"central_reserve/services/customer/internal/domain"
	"central_reserve/services/customer/internal/infra/primary/handlers/clienthandler/request"
)

// ClientToDomain convierte un request.Client a entities.Client
func ClientToDomain(c request.Client) domain.Client {
	return domain.Client{
		BusinessID: c.BusinessID,
		Name:       c.Name,
		Email:      c.Email,
		Phone:      c.Phone,
	}
}
